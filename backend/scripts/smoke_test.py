import json
import sys
import time
import urllib.parse
import urllib.request

TEST_USERNAME = f"smoke_superadmin_{int(time.time())}"
TEST_PASSWORD = "smoke-pass-123"

BASE = 'http://127.0.0.1:8000/api'

def post_json(path, data, headers=None):
    url = BASE + path
    hdrs = {'Content-Type': 'application/json'}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=hdrs)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.load(resp)


def post_form(path, data):
    url = BASE + path
    data_bytes = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.load(resp)


def get(path, token=None):
    url = BASE + path
    hdrs = {}
    if token:
        hdrs['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.load(resp)


# wait for server
for i in range(40):
    try:
        _ = get('/hello')
        break
    except Exception as e:
        time.sleep(0.5)
else:
    print('ERROR: backend did not respond at', BASE)
    sys.exit(1)

print('backend reachable')

# Register a direct superadmin user for the smoke test.
# Admin and school users now require approval, so they are not suitable
# for immediate login in this script.
try:
    r = post_json('/auth/register', {
        'username': TEST_USERNAME,
        'password': TEST_PASSWORD,
        'role': 'superadmin',
        'full_name': 'Smoke Test Admin',
    })
    print('register response:', r)
except Exception as e:
    print('ERROR registering smoke-test superadmin:', str(e))
    sys.exit(2)

# Obtain token
try:
    t = post_form('/auth/token', {'username': TEST_USERNAME, 'password': TEST_PASSWORD})
    print('token response keys:', list(t.keys()))
    token = t.get('access_token')
    if not token:
        print('ERROR: no access_token in response', t)
        sys.exit(2)
    print('got token')
except Exception as e:
    print('ERROR getting token:', e)
    sys.exit(2)

# get /auth/me
try:
    me = get('/auth/me', token)
    print('/auth/me ->', me)
except Exception as e:
    print('ERROR /auth/me', e)

# create protected school
try:
    school = post_json(
        '/admin/schools',
        {'name': f'Auto School {int(time.time())}', 'address': '123 Auto Rd'},
        headers={'Authorization': f'Bearer {token}'},
    )
    print('created school', school)
except Exception as e:
    print('ERROR creating school', e)

# list schools
try:
    schools = get('/admin/schools', token)
    print('schools list length:', len(schools))
except Exception as e:
    print('ERROR listing schools', e)

# activities for the created school (if present)
try:
    sid = school.get('id') if isinstance(school, dict) else None
    if sid:
        acts = get(f'/schools/{sid}/activities', token)
        print('activities:', acts)
    else:
        print('no school id to fetch activities')
except Exception as e:
    print('ERROR activities', e)

print('smoke test finished')
