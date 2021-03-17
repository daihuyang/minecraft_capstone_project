import sys
sys.path.append("..")

import unittest
from data_io import (
    write_event,
    read_events
)

class TestStorage(unittest.TestCase):
    def setUp(self):
        return super().setUp()

    def tearDown(self):
        return super().tearDown()

    def test_write_event(self):
        pass

    def test_read_events(self):
        pass


if __name__ == '__main__':
    unittest.main()