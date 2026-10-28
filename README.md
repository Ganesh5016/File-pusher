# Snap2Doc — Photo to Word Document & GitHub Uploader

**Snap2Doc** is a complete, production-ready web application that enables users to upload photos, enter descriptions and custom captions, configure page orientations and image alignments, automatically generate genuine Microsoft Word (`.docx`) documents, preview them in the browser, and upload the resulting Word files directly to any GitHub repository and branch.

---

## 🌟 Key Features

1. **Photo Upload & Processing**:
   - Drag-and-drop and file-picker image upload with multi-file support.
   - Supports **JPG**, **JPEG**, **PNG**, and **WEBP** images.
   - **EXIF Auto-Orientation**: Automatically rotates mobile photos right-side-up based on EXIF camera tags.
   - **Smart Resizing & Optimization**: Automatically scales oversized images using high-quality Lanczos resampling to prevent bloated Word documents while maintaining high resolution.
   - Per-photo captions and intuitive reordering (move earlier / move later).

2. **Genuine Word Document Generation (`.docx`)**:
   - Uses `python-docx` to produce authentic Microsoft Word documents (compatible with Microsoft Office 365, Word 2016+, LibreOffice, and Google Docs).
   - Sanitized filenames based on user description (e.g., `College Event Report` becomes `College_Event_Report.docx`).
   - Page Orientation selection: **Portrait** (8.5" x 11") and **Landscape** (11" x 8.5").
   - Image Alignment: **Center**, **Left**, or **Right**.
   - Photo Sizing presets: **Standard** (5.5" balanced), **Large** (6.4"), **Compact** (4.2"), or **Full Width**.
   - Optional introductory paragraphs, figure captions, headers, and footers.
   - Optional page breaks between images.

3. **In-Browser Document Preview**:
   - HTML preview rendered directly from the compiled `.docx` container via `mammoth`.
   - Authentic simulated Word sheet display with realistic paper margins, typography, and embedded images.
   - Direct download button for the genuine `.docx` file.

4. **Seamless GitHub Integration**:
   - Direct integration with GitHub's Contents REST API.
   - **Binary Fidelity**: Uploads the real `.docx` binary via Base64 encoding—never a text simulation.
   - Repository browser: Select any repository you have push permissions to (public or private).
   - Branch picker: Select default or custom branches.
   - Target directory path: Specify custom folders (e.g. `documents/2026/` or root).
   - Conflict detection: Queries GitHub before committing to warn if a file already exists and asks for confirmation to overwrite.
   - Generates clickable commit links and direct "Open on GitHub" file links.

5. **Security & Privacy by Design**:
   - **No Secret Exposure**: Personal Access Tokens are handled server-side and never exposed to the client browser.
   - **Session Purge**: Temporary raw photos are cleaned up immediately following document assembly.
   - Path sanitization to prevent directory traversal.
   - Persistent SQLite history tracking actual document records and GitHub commit metadata.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Backend** | Python 3.11+ / 3.13, FastAPI, Uvicorn |
| **Document Engine** | `python-docx` (Word generation), `Pillow` (EXIF & Lanczos scaling), `mammoth` (HTML preview) |
| **Database** | SQLite3 (Persistent document metadata and GitHub config) |
| **GitHub Sync** | GitHub REST API v3 via async `httpx` |

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Python 3.10+** (Python 3.13 tested and verified)
- **Node.js 18+** and **npm**

### 1. Clone or Open Workspace
```bash
cd "c:/Users/ganes_pof59a1/Documents/File uploader"
```

### 2. Backend Setup
Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

Run the FastAPI backend server:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000` (API documentation available at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup
In a second terminal, start the Vite development server:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at `http://127.0.0.1:5173/`.

*(Note: The FastAPI backend also automatically serves the production build directly at `http://127.0.0.1:8000/`).*

---

## 🔑 GitHub Personal Access Token (PAT) Setup

To sync generated Word documents to your GitHub repositories:

1. Navigate to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).
2. Choose **Tokens (classic)** > **Generate new token (classic)**:
   - Note: `Snap2Doc Uploader`
   - Scope: Check `repo` (Full control of private repositories and commits).
   - Alternatively, create a **Fine-grained Personal Access Token** with `Contents: Read and write` permission for your target repositories.
3. Copy your token (starts with `ghp_` or `github_pat_`).
4. In Snap2Doc, click **GitHub Settings** in the navigation menu.
5. Paste your token and click **Save & Connect GitHub**.
6. The token is validated against the GitHub API, masked for security, and stored server-side.

---

## 📋 API Endpoints Reference

### Documents API (`/api/documents`)
- `POST /api/documents/generate`: Generates a `.docx` file from multipart image uploads and layout settings.
- `GET /api/documents`: Lists all saved documents from SQLite history.
- `GET /api/documents/{id}`: Retrieves metadata for a specific document.
- `GET /api/documents/{id}/download`: Downloads the genuine Microsoft Word `.docx` binary.
- `GET /api/documents/{id}/preview`: Returns rendered HTML preview with embedded images.
- `DELETE /api/documents/{id}`: Deletes the document file and database record.

### GitHub Integration API (`/api/github`)
- `POST /api/github/test-connection`: Tests a GitHub Personal Access Token.
- `GET /api/github/settings`: Returns active connection status and masked profile without exposing raw secrets.
- `POST /api/github/settings`: Securely stores the active GitHub token in backend database.
- `DELETE /api/github/settings`: Disconnects the GitHub account.
- `GET /api/github/repositories`: Lists repositories the authenticated user can push to.
- `GET /api/github/branches`: Lists branches for a specified repository.
- `POST /api/github/check-conflict`: Checks if a file already exists at the destination path.
- `POST /api/github/upload`: Encodes the `.docx` file as Base64 and commits it via the GitHub Contents API.

---

## 🧪 Automated Verification Suite

To run the end-to-end API test suite (which validates Word document generation, binary validity, ZIP/DOCX magic bytes, HTML preview rendering, and GitHub security):

```bash
python backend/test_workflow.py
```

Expected output:
```
=== 1. Testing Document Generation API ===
Generate Status: 200
Generated doc ID: ...
Filename: Annual_Tech_Conference_2026.docx
Images count: 2
File size: 40996 bytes

=== 2. Testing Document List API ===
List status: 200 Count: ...

=== 3. Testing Word Document Binary Download ===
Download Status: 200
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Has valid ZIP/DOCX magic bytes (PK\x03\x04): True
Title in doc: True

=== 4. Testing HTML Preview API ===
Preview Status: 200 HTML len: 7247

=== 5. Testing GitHub Test Connection API (Security Validation) ===
GitHub Test Status: 200 Response: {'valid': False, ...}

=== 6. Testing GitHub Settings API ===
GitHub Settings Status: 200 Config: ...

=== ALL 6 COMPREHENSIVE E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===
```

---

## 🛡️ Security Best Practices

- **Zero Client Token Exposure**: The frontend never holds raw GitHub access tokens in local storage, cookies, or logs.
- **Server-Side Masking**: Tokens retrieved through `/api/github/settings` are masked (e.g., `ghp_...1234`).
- **Temporary Upload Scrubbing**: All uploaded source images are purged from disk after document generation.
- **Path Sanitization**: Document names and destination paths are sanitized using regex to prevent directory traversal (`../`).

---

## 🌐 Deploy to Render

### Method 1: Docker (Recommended)
1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Connect your repository `File-pusher`.
4. Render will automatically detect the `Dockerfile` in the root.
5. Choose the **Free** instance type.
6. Click **Deploy Web Service**.
7. Once deployed, open your Render URL to use Snap2Doc!

### Method 2: Native Python Runtime
1. In Render, select **New +** > **Web Service** and choose your repository.
2. Configure settings:
   - **Environment**: `Python`
   - **Build Command**: `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Click **Deploy Web Service**.

