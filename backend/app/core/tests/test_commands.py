"""
Test cutom Django mamagement commands.
"""
from unittest.mock import patch

from psycopg2 import OperationalError as Psycopg2Error

from django.core.management import call_command
from django.db.utils import OperationalError
from django.test import SimpleTestCase


@patch('core.management.commands.wait_for_db.Command.check')
class CommandTests(SimpleTestCase):
    """Test commands."""

    def test_wait_for_db_ready(self, patched_ckeck):
        """Test waiting for database if database ready."""
        patched_ckeck.return_value = True

        call_command('wait_for_db')

        patched_ckeck.assert_called_once_with(databases=['default'])

    @patch('time.sleep')
    def test_wait_for_db_delay(self, patched_sleep, patched_ckeck):
        """Test waiting for database when getting Operational Error."""
        patched_ckeck.side_effect = [Psycopg2Error] * 2 + \
            [OperationalError] * 3 + [True]

        call_command('wait_for_db')

        self.assertEqual(patched_ckeck.call_count, 6)
        patched_ckeck.assert_called_with(databases=['default'])
