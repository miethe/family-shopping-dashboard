import os
import subprocess
import sys
import unittest
from pathlib import Path
from validate_server_url import valid_origin


class ServerURLTests(unittest.TestCase):
    def test_valid_origins(self):
        for value in ("https://confetti.meaty.cloud:3447", "https://example.com/", "https://[::1]:3447"):
            with self.subTest(value=value):
                self.assertTrue(valid_origin(value))

    def test_build_script_exit_status(self):
        script = Path(__file__).with_name("validate_server_url.py")
        for value, expected in (("https://confetti.meaty.cloud:3447", 0), ("", 1),
                                ("   ", 1), ("https://$(HOST)", 1), ("https://${HOST}", 1),
                                ("https:///missing", 1), ("http://example.com", 1),
                                ("https://example.com/path", 1),
                                ("https://[::1]suffix:3447", 1), ("https://host:port:extra", 1),
                                ("https://[::1]:3447", 0), ("https://user@host", 1),
                                ("https://host:0", 1), ("https://host:99999", 1)):
            with self.subTest(value=value):
                result = subprocess.run([sys.executable, str(script)],
                                        env={**os.environ, "CONFETTI_SERVER_URL": value},
                                        capture_output=True)
                self.assertEqual(result.returncode, expected)

    def test_invalid_origins(self):
        for value in ("", "  ", "https://$(HOST)", "https://${HOST}", "http://example.com",
                      "https:///missing", "https://example.com/path", "https://example.com:abc",
                      "https://example.com:0", "https://example.com:65536", "https://example.com:",
                      "https://user@example.com", "https://example.com?", "https://example.com#",
                      "https://bad host", "https://example.com\\evil"):
            with self.subTest(value=value):
                self.assertFalse(valid_origin(value))


if __name__ == "__main__":
    unittest.main()
