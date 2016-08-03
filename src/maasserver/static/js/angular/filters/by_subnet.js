/* Copyright 2016 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 *
 * Filter objects with subnet foreign key references by a particular subnet.
 */

angular.module('MAAS').filter('filterBySubnet', function() {
    return function(foreign_objects, subnet) {
        var filtered = [];
        var id;
        if(angular.isObject(subnet)) {
            id = subnet.id;
        } else if(angular.isNumber(subnet)) {
            id = subnet;
        } else {
            return filtered;
        }
        angular.forEach(foreign_objects, function(obj) {
            if(obj.subnet === id) {
                filtered.push(obj);
            }
        });
        return filtered;
    };
});