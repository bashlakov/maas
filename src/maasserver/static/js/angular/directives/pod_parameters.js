/* Copyright 2017-2018 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 *
 * Pod parameters directive.
 */

angular.module('MAAS').run(['$templateCache', function ($templateCache) {
    // Inject the power-parameters.html into the template cache.
    $templateCache.put('directive/templates/pod-parameters.html', [
        '<maas-obj-field type="options" key="type" label="Pod type" ',
          'label-width="2" input-width="5" ',
          'placeholder="Select the pod type" ',
          'options="type.name as type.description for type in podTypes" ',
          'ng-if="!hideType">',
        '</maas-obj-field>',
        '<div pod-fields></div>'
    ].join(''));
}]);


angular.module('MAAS').directive(
    'maasPodParameters', [
        '$compile', 'GeneralManager', 'ManagerHelperService', function(
        $compile, GeneralManager, ManagerHelperService) {
    return {
        restrict: "E",
        require: "^^maasObjForm",
        scope: {
          hideType: '='
        },
        templateUrl: 'directive/templates/pod-parameters.html',
        link: function(scope, element, attrs, controller) {
            scope.powerTypes = GeneralManager.getData('power_types');
            scope.podTypes = [];
            scope.type = null;

            var childScope, fieldsElement = angular.element(
                element.find('div[pod-fields]'));

            // Function to update the editable fields.
            var updateFields = function(podType) {
                var type = null;
                var i;
                for(i = 0; i < scope.podTypes.length; i++) {
                    if(scope.podTypes[i].name === podType) {
                      type = scope.podTypes[i];
                    }
                }

                fieldsElement.empty();
                if(childScope) {
                  childScope.$destroy();
                }
                if(angular.isObject(type)) {
                  var html = '<maas-obj-field-group>';
                  angular.forEach(type.fields, function(field) {
                      if(field.scope === 'bmc') {
                          if(field.name === 'power_pass') {
                              html += (
                                  '<maas-obj-field type="password" key="');
                          } else {
                              html += (
                                  '<maas-obj-field type="text" key="');
                          }
                          html += (field.name + '" label="' + field.label +
                            '" ' + 'label-width="2" input-width="5">' +
                            '</maas-obj-field>');
                      }
                  });

                  if(type.name === 'virsh' && attrs.hideSlider !== "true") {
                      html += (
                          '<maas-obj-field type="slider" key="' +
                          'cpu_over_commit_ratio" label="CPU over commit" ' +
                          'min="0" max="10" label-width="2" input-width="5">' +
                          '</maas-obj-field>');
                      html += (
                          '<maas-obj-field type="slider" key="' +
                          'memory_over_commit_ratio" label="' +
                          'Memory over commit" min="0" max="10" ' +
                          'label-width="2" input-width="5"></maas-obj-field>');
                  }
                  html += '</maas-obj-field-group>';
                  childScope = scope.$new();
                  var ele = angular.element(html);
                  fieldsElement.append(ele);
                  $compile(ele)(
                      childScope, undefined, {maasObjForm: controller});
                }
            };

            // Return the selected type.
            var getType = function() {
                if(scope.hideType) {
                    return controller.obj.type;
                } else {
                    return controller.getValue('type');
                }
            };

            // Update the fields when the type changes.
            scope.$watch(getType, updateFields);

            // Update the pod types when the power types is updated.
            scope.$watchCollection("powerTypes", function() {
                scope.podTypes.length = 0;
                angular.forEach(scope.powerTypes, function(type) {
                    if(type.driver_type === "pod") {
                        scope.podTypes.push(type);
                    }
                });
                updateFields(getType());
            });

            // Load the general manager.
            ManagerHelperService.loadManager(scope, GeneralManager);
        }
    };
}]);
