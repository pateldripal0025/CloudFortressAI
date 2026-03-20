import requests
url = "http://localhost:5000/api/v1/scans/start"
data = {"provider": "AWS"}
try:
    response = requests.post(url, json=data)
    print(response.status_code)
    print(response.json())
except Exception as e:
    print(e)
