import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "version", Path(__file__).parents[1] / "version.py"
)
version = importlib.util.module_from_spec(spec)
spec.loader.exec_module(version)


def ref(number, sha="older"):
    return {"ref": f"refs/tags/v0.{number}", "object": {"sha": sha}}


class VersionTests(unittest.TestCase):
    def test_first_release(self):
        self.assertEqual(version.choose_version([], "current"), ("0.1", True))

    def test_numeric_order_and_unrelated_tags(self):
        refs = [ref(9), ref(10), {"ref": "refs/tags/v0.beta"}]
        self.assertEqual(version.choose_version(refs, "current"), ("0.11", True))

    def test_retry_preserves_reserved_version(self):
        self.assertEqual(
            version.choose_version([ref(2, "current"), ref(3)], "current"),
            ("0.2", False),
        )

    def test_ambiguous_version_is_rejected(self):
        with self.assertRaises(ValueError):
            version.choose_version([ref(1, "current"), ref(2, "current")], "current")


if __name__ == "__main__":
    unittest.main()
