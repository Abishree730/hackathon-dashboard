import json
import os
import requests

ORG = "HACK2TECHSUSTAIN-2-0"
TOKEN = os.environ["GITHUB_TOKEN"]

HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github+json"
}

with open("data/teams.json") as f:
    teams = json.load(f)

for team_id, info in teams.items():
    repo = info["repo"]

    url = f"https://api.github.com/repos/{ORG}/{repo}/branches/main/protection"

    payload = {
        "required_status_checks": None,
        "enforce_admins": False,
        "required_pull_request_reviews": None,
        "restrictions": None,
        "allow_force_pushes": True,
        "allow_deletions": False
    }

    r = requests.put(url, headers=HEADERS, json=payload)

    if r.status_code not in (200, 201):
        print(f"Failed for {repo}: {r.status_code} {r.text}")
    else:
        print(f"Branch locked for {repo}")
