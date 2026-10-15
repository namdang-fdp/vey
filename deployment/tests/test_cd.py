import os
import subprocess
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "cd.sh"


class DeployTests(unittest.TestCase):
    def deploy(self, mode, previous="0.1", frontend_previous=None):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for app in ["vey-backend", "vey-frontend"]:
                (root / app).mkdir()
                value = frontend_previous if app == "vey-frontend" else previous
                (root / app / ".env").write_text(
                    f"VERSION={value or previous}\nSECRET='keep-this-value'\n"
                )
                (root / app / "compose.yaml").touch()
            binary = root / "bin"
            binary.mkdir()
            docker = binary / "docker"
            docker.write_text("""#!/usr/bin/env bash
if [[ "$1" == inspect ]]; then echo healthy; exit; fi
if [[ "$*" == *" up "* && "$VERSION" == 0.2 && "$TEST_MODE" == fail-up ]]; then exit 1; fi
if [[ "$*" == *" pull"* && "$TEST_MODE" == fail-pull ]]; then exit 1; fi
exit 0
""")
            docker.chmod(0o755)
            result = subprocess.run(
                ["bash", str(SCRIPT), "0.2"],
                env={
                    **os.environ,
                    "PATH": str(binary) + ":" + os.environ["PATH"],
                    "VEY_DEPLOY_ROOT": str(root),
                    "TEST_MODE": mode,
                },
                capture_output=True, text=True,
            )
            files = [(root / app / ".env").read_text() for app in ["vey-backend", "vey-frontend"]]
            return result, files

    def test_success_records_version_and_preserves_secrets(self):
        result, files = self.deploy("success")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(all("VERSION=0.2\n" in value for value in files))
        self.assertTrue(all("SECRET='keep-this-value'" in value for value in files))

    def test_failed_pull_keeps_previous_version(self):
        result, files = self.deploy("fail-pull")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Image pull failed", result.stderr)
        self.assertTrue(all("VERSION=0.1\n" in value for value in files))

    def test_failed_update_restores_both_env_files(self):
        result, files = self.deploy("fail-up")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Deploy failed", result.stderr)
        self.assertTrue(all("VERSION=0.1\n" in value for value in files))

    def test_inconsistent_versions_are_rejected(self):
        result, files = self.deploy("success", frontend_previous="0.3")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Inconsistent", result.stderr)
        self.assertIn("VERSION=0.1\n", files[0])
        self.assertIn("VERSION=0.3\n", files[1])

    def test_failed_initial_deploy_restores_unreleased_state(self):
        result, files = self.deploy("fail-up", previous="0.0")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Deploy failed", result.stderr)
        self.assertTrue(all("VERSION=0.0\n" in value for value in files))

    def test_version_cannot_inject_shell_commands(self):
        result = subprocess.run(
            ["bash", str(SCRIPT), "0.2; echo injected"], capture_output=True, text=True
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Invalid release version", result.stderr)


if __name__ == "__main__":
    unittest.main()
