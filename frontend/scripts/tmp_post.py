import urllib.request, json, sys
url='http://127.0.0.1:8000/api/auth/register'
data=json.dumps({'username':'admin','password':'adminpass','role':'superadmin','full_name':'Admin'}).encode('utf-8')
req=urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print('STATUS', r.status)
        print(r.read().decode())
except Exception as e:
    print('ERR', e)
    try:
        import urllib.error
        if isinstance(e, urllib.error.HTTPError):
            print('BODY', e.read().decode())
    except Exception:
        pass
    sys.exit(1)
