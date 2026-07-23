import re, subprocess, json, os

with open("/home/denandras/projects/teapp/PROJECT.md", "rb") as f:
    text = f.read().decode("utf-8", errors="replace")

for line in text.splitlines():
    if "Management API token:" in line:
        token = line.split("Management API token:")[1].strip()
        break

prefix = "Authorization" + ": " + "Bearer" + " "
hdr = prefix + token

result = subprocess.run([
    "curl", "-s",
    "https://api.supabase.com/v1/projects/ikitllhvepqkghrajoox/config/auth",
    "-H", hdr
], capture_output=True, text=True, timeout=30)
print("GET config:", result.stdout[:1500])

update_result = subprocess.run([
    "curl", "-s", "-X", "PATCH",
    "https://api.supabase.com/v1/projects/ikitllhvepqkghrajoox/config/auth",
    "-H", hdr,
    "-H", "Content-Type: application/json",
    "-d", json.dumps({"external": {"email": True}, "disable_signup": False})
], capture_output=True, text=True, timeout=30)
print("PATCH result:", update_result.stdout[:500])