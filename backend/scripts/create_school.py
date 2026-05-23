import requests
import sys

data = {"name": "Green Valley School", "address": "123 Main St"}
res = requests.post('http://127.0.0.1:8000/api/admin/schools/dev', json=data)
print(res.status_code)
print(res.text)
