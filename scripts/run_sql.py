import json, subprocess

sql = open("/tmp/teapp/scripts/add-fk-constraints.sql").read()
payload = json.dumps({"query": sql})
with open("/tmp/teapp/scripts/payload.json", "w") as f:
    f.write(payload)

# Read token from PROJECT.md
import re
md = open("/home/denandras/projects/teapp/PROJECT.md").read()
m = re.search(r"Management API token:\s*(\S+)", md)
token = m.group(1)
auth = "Authorization: Bearer " + token
result = subprocess.run([
    "curl", "-s", "-X", "POST",
    "https://api.supabase.com/v1/projects/ikitllhvepqkghrajoox/database/query",
    "-H", auth,
    "-H", "Content-Type: application/json",
    "-d", "@/tmp/teapp/scripts/payload.json"
], capture_output=True, text=True, timeout=30)
print("Result:", result.stdout[:500])