# Copyright 2014-2017 Canonical Ltd.  This software is licensed under the
# GNU Affero General Public License version 3 (see the file LICENSE).

"""Test maasserver.stats."""

__all__ = []

import base64
import json

from django.db import transaction
from maasserver import stats
from maasserver.models import Config
from maasserver.stats import (
    get_maas_stats,
    get_machine_stats,
    get_request_params,
    make_maas_user_agent_request,
)
from maasserver.testing.factory import factory
from maasserver.testing.testcase import (
    MAASServerTestCase,
    MAASTransactionServerTestCase,
)
from maastesting.matchers import (
    MockCalledOnce,
    MockNotCalled,
)
from maastesting.testcase import MAASTestCase
from maastesting.twisted import extract_result
from provisioningserver.utils.twisted import asynchronous
import requests as requests_module
from twisted.application.internet import TimerService
from twisted.internet.defer import fail


class TestMAASStats(MAASServerTestCase):

    def test_get_maas_stats(self):
        # Make one component of everything
        factory.make_RegionRackController()
        factory.make_RegionController()
        factory.make_RackController()
        factory.make_Machine(cpu_count=2, memory=200)
        factory.make_Machine(cpu_count=3, memory=100)
        factory.make_Device()

        stats = get_maas_stats()
        machine_stats = get_machine_stats()

        # Due to floating point calculation subtleties, sometimes the value the
        # database returns is off by one compared to the value Python
        # calculates, so just get it directly from the database for the test.
        total_storage = machine_stats['total_storage']

        compare = {
            "controllers": {
                "regionracks": 1,
                "regions": 1,
                "racks": 1,
            },
            "nodes": {
                "machines": 2,
                "devices": 1,
            },
            "machine_stats": {
                "total_cpu": 5,
                "total_mem": 300,
                "total_storage": total_storage,
            },
        }
        self.assertEquals(stats, json.dumps(compare))

    def test_get_request_params_returns_params(self):
        factory.make_RegionRackController()
        params = {
            "data": base64.b64encode(
                json.dumps(get_maas_stats()).encode()).decode()
        }
        self.assertEquals(params, get_request_params())

    def test_make_user_agent_request(self):
        factory.make_RegionRackController()
        mock = self.patch(requests_module, "get")
        make_maas_user_agent_request()
        self.assertThat(mock, MockCalledOnce())


class TestStatsService(MAASTestCase):
    """Tests for `ImportStatsService`."""

    def test__is_a_TimerService(self):
        service = stats.StatsService()
        self.assertIsInstance(service, TimerService)

    def test__runs_once_a_day(self):
        service = stats.StatsService()
        self.assertEqual(86400, service.step)

    def test__calls__maybe_make_stats_request(self):
        service = stats.StatsService()
        self.assertEqual(
            (service.maybe_make_stats_request, (), {}),
            service.call)

    def test_maybe_make_stats_request_does_not_error(self):
        service = stats.StatsService()
        deferToDatabase = self.patch(stats, "deferToDatabase")
        exception_type = factory.make_exception_type()
        deferToDatabase.return_value = fail(exception_type())
        d = service.maybe_make_stats_request()
        self.assertIsNone(extract_result(d))


class TestStatsServiceAsync(MAASTransactionServerTestCase):
    """Tests for the async parts of `StatsService`."""

    def test_maybe_make_stats_request_makes_request(self):
        mock_call = self.patch(stats, "make_maas_user_agent_request")

        with transaction.atomic():
            Config.objects.set_config('enable_analytics', True)

        service = stats.StatsService()
        maybe_make_stats_request = asynchronous(
            service.maybe_make_stats_request)
        maybe_make_stats_request().wait(5)

        self.assertThat(mock_call, MockCalledOnce())

    def test_maybe_make_stats_request_doesnt_make_request(self):
        mock_call = self.patch(stats, "make_maas_user_agent_request")

        with transaction.atomic():
            Config.objects.set_config('enable_analytics', False)

        service = stats.StatsService()
        maybe_make_stats_request = asynchronous(
            service.maybe_make_stats_request)
        maybe_make_stats_request().wait(5)

        self.assertThat(mock_call, MockNotCalled())
