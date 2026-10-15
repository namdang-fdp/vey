"""Reserve a readable release tag; reruns reuse the same version."""

import json
import os
import re
import subprocess
from pathlib import Path


def choose_version(refs, sha):
    releases = []
    for ref in refs:
        match = re.fullmatch(r"refs/tags/v0\.([1-9][0-9]*)", ref["ref"])
        if match:
            releases.append((int(match[1]), ref["object"]["sha"]))
    existing = [minor for minor, commit in releases if commit == sha]
    if len(existing) > 1:
        raise ValueError("Multiple release versions reference this commit")
    if existing:
        return f"0.{existing[0]}", False
    return f"0.{max((minor for minor, _ in releases), default=0) + 1}", True


def main():
    release = (
        os.environ["GITHUB_REF"] == "refs/heads/main"
        and os.environ["GITHUB_EVENT_NAME"] != "pull_request"
    )
    if release:
        repository = os.environ["GITHUB_REPOSITORY"]
        sha = os.environ["GITHUB_SHA"]
        refs = json.loads(
            subprocess.check_output(
                ["gh", "api", f"repos/{repository}/git/matching-refs/tags/v0."],
                text=True,
            )
        )
        version, reserve = choose_version(refs, sha)
        if reserve:
            subprocess.run(
                [
                    "gh", "api", "--method", "POST",
                    f"repos/{repository}/git/refs",
                    "-f", f"ref=refs/tags/v{version}", "-f", f"sha={sha}",
                ],
                check=True, stdout=subprocess.DEVNULL,
            )
    else:
        version = f"dev-{os.environ['GITHUB_RUN_NUMBER']}"
    with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
        output.write(f"version={version}\n")
    print(f"Image version: {version}")


if __name__ == "__main__":
    main()
