import urllib.request
import urllib.parse
import json
import io
from PIL import Image, ImageDraw
import httpx
from docx import Document

print("=== 1. Testing Document Generation API ===")
# Generate 2 test images
img1 = Image.new('RGB', (600, 400), color=(37, 99, 235))
d1 = ImageDraw.Draw(img1)
d1.text((50, 180), "Keynote Presentation", fill=(255, 255, 255))
buf1 = io.BytesIO()
img1.save(buf1, format="JPEG")
buf1.seek(0)

img2 = Image.new('RGB', (600, 400), color=(16, 185, 129))
d2 = ImageDraw.Draw(img2)
d2.text((50, 180), "Workshop Demonstration", fill=(255, 255, 255))
buf2 = io.BytesIO()
img2.save(buf2, format="JPEG")
buf2.seek(0)

client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=20.0)

files = [
    ("images", ("keynote.jpg", buf1.getvalue(), "image/jpeg")),
    ("images", ("workshop.jpg", buf2.getvalue(), "image/jpeg"))
]
data = {
    "title": "Annual Tech Conference 2026",
    "intro_text": "Welcome to the executive report and photo gallery for the 2026 conference.",
    "page_orientation": "portrait",
    "image_alignment": "center",
    "image_size": "standard",
    "captions": json.dumps([
        {"original_filename": "keynote.jpg", "caption": "Figure 1: Opening Keynote Address"},
        {"original_filename": "workshop.jpg", "caption": "Figure 2: Interactive Cloud Lab"}
    ])
}

res = client.post("/api/documents/generate", data=data, files=files)
print("Generate Status:", res.status_code)
assert res.status_code == 200, f"Generate failed: {res.text}"
doc_data = res.json()
doc_id = doc_data["id"]
print("Generated doc ID:", doc_id)
print("Filename:", doc_data["filename"])
print("Images count:", doc_data["image_count"])
print("File size:", doc_data["file_size_bytes"], "bytes")

print("\n=== 2. Testing Document List API ===")
list_res = client.get("/api/documents")
print("List status:", list_res.status_code, "Count:", len(list_res.json()))
assert list_res.status_code == 200

print("\n=== 3. Testing Word Document Binary Download ===")
dl_res = client.get(f"/api/documents/{doc_id}/download")
print("Download Status:", dl_res.status_code)
print("Content-Type:", dl_res.headers.get("content-type"))
content_disp = dl_res.headers.get("content-disposition")
print("Content-Disposition:", content_disp)
is_valid_docx = dl_res.content[:4] == b"PK\x03\x04"
print("Has valid ZIP/DOCX magic bytes (PK\\x03\\x04):", is_valid_docx)
assert is_valid_docx, "Downloaded file does not have valid DOCX magic bytes!"

# Verify with python-docx that it opens without error
doc_obj = Document(io.BytesIO(dl_res.content))
paragraphs = [p.text for p in doc_obj.paragraphs if p.text]
print("Doc paragraphs count:", len(paragraphs))
has_title = any("Annual Tech Conference 2026" in p for p in paragraphs)
print("Title in doc:", has_title)
assert has_title, "Document missing title text!"

print("\n=== 4. Testing HTML Preview API ===")
preview_res = client.get(f"/api/documents/{doc_id}/preview")
print("Preview Status:", preview_res.status_code, "HTML len:", len(preview_res.text))
assert preview_res.status_code == 200
assert "<img" in preview_res.text, "Preview HTML missing rendered images!"

print("\n=== 5. Testing GitHub Test Connection API (Security Validation) ===")
gh_test_res = client.post("/api/github/test-connection", json={"token": "ghp_invalid_mock_token_for_security_test"})
print("GitHub Test Status:", gh_test_res.status_code, "Response:", gh_test_res.json())
assert gh_test_res.json()["valid"] == False, "Invalid token unexpectedly passed!"

print("\n=== 6. Testing GitHub Settings API ===")
gh_settings_res = client.get("/api/github/settings")
print("GitHub Settings Status:", gh_settings_res.status_code, "Config:", gh_settings_res.json())
assert "token" not in gh_settings_res.json(), "Raw token was exposed in settings response!"

print("\n=== ALL 6 COMPREHENSIVE E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
