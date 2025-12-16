import requests

API = "https://api.github.com"

def gh(headers, method, url, **kwargs):
    r = requests.request(method, API + url, headers=headers, **kwargs)
    if r.status_code not in (200, 201, 204):
        raise RuntimeError(f"{r.status_code}: {r.text}")
    return r.json() if r.text else None
