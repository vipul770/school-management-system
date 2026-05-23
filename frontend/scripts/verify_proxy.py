import json
import sys
import time
import urllib.parse
import urllib.request

TEST_USERNAME = f"proxy_superadmin_{int(time.time())}"
TEST_PASSWORD = "proxy-pass-123"

BASE = 'http://127.0.0.1:3001/api'

def post_form(path,data):
    url = BASE+path
    data_bytes = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers={'Content-Type':'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.load(resp)

def get(path, token=None):
    url = BASE+path
    hdrs={}
    if token: hdrs['Authorization']=f'Bearer {token}'
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.load(resp)

# wait
for i in range(20):
    try:
        r = urllib.request.urlopen('http://127.0.0.1:3001', timeout=3)
        break
    except Exception:
        time.sleep(0.5)
else:
    print('frontend not reachable')
    sys.exit(1)

print('frontend reachable')

# Register and log in a dedicated superadmin user via the frontend proxy.
try:
    req = urllib.request.Request(
        BASE + '/auth/register',
        data=json.dumps({
            'username': TEST_USERNAME,
            'password': TEST_PASSWORD,
            'role': 'superadmin',
            'full_name': 'Proxy Test Admin',
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('registered smoke user:', resp.status)
except Exception as e:
    print('register error', e)
    sys.exit(2)

try:
    t = post_form('/auth/token', {'username': TEST_USERNAME, 'password': TEST_PASSWORD})
    token = t.get('access_token')
    print('got token through proxy:', bool(token))
except Exception as e:
    print('token error', e)
    sys.exit(2)

# list schools through proxy
try:
    schools = get('/admin/schools', token)
    print('schools len', len(schools))
    sid = schools[0]['id'] if schools else None
except Exception as e:
    print('schools error', e); sys.exit(3)

# create classroom
if sid:
    try:
        req = urllib.request.Request(BASE+f'/schools/{sid}/classrooms', data=json.dumps({'name':'ProxyClass'}).encode('utf-8'), headers={'Content-Type':'application/json','Authorization':f'Bearer {token}'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            out = json.load(resp)
            print('created classroom id', out.get('id'))
    except Exception as e:
        print('create class error', e)

print('verify finished')
