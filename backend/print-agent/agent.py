import time, subprocess, requests

API_URL = "http://localhost:8000/print/pending"

def send_to_printer(file_path, copies):
    for _ in range(copies):
        subprocess.run(["lp", file_path])

while True:
    try:
        jobs = requests.get(API_URL).json()
        for job in jobs:
            send_to_printer(job["file_path"], job["copies"])
            requests.post(f"http://localhost:8000/print/mark_done/{job['id']}")
    except Exception as e:
        print("Error:", e)
    time.sleep(5)
