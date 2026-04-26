# 🎓 Smart College Resource Hub
### Government Polytechnic College Waidhan — RGPV University

> A production-ready full-stack academic resource management platform for polytechnic students. Upload, manage, browse, and download study materials organized by Branch → Semester → Subject → Unit → Content Type.

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 📚 Resource Browser | Browse materials by Branch → Semester → Subject → Unit |
| 📤 Upload System | Students upload files with unit-level tagging |
| ✅ Admin Approval | Admin manually approves/rejects every upload |
| 📊 Analytics Dashboard | Top subjects, contributors, downloaded files |
| 📋 Access Logs | Every view & download tracked with user + timestamp |
| 🔔 Notifications | Students notified on approval/rejection |
| 🔐 JWT Auth | Secure student + admin login |
| 📱 PWA | Installable, mobile-responsive |
| 🔍 Duplicate Detection | SHA-256 file hash prevents duplicate uploads |

---

## 🏗️ Project Structure

```
smart-college-hub/
├── backend/                     # FastAPI Python backend
│   ├── main.py                  # App entry point, CORS, routes
│   ├── database.py              # SQLAlchemy engine + session
│   ├── models.py                # All DB models (User, Resource, Unit, etc.)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── auth.py                  # JWT auth, password hashing
│   ├── seed_data.py             # Initial data (branches, subjects, admin)
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   ├── uploads/                 # Uploaded files stored here
│   └── routers/
│       ├── auth.py              # /api/auth/* — register, login, me
│       ├── academic.py          # /api/academic/* — branches, sems, subjects, units
│       ├── resources.py         # /api/resources/* — upload, download, view
│       ├── admin.py             # /api/admin/* — approvals, analytics, users
│       └── notifications.py     # /api/notifications/*
│
└── frontend/                    # React + Vite + Tailwind CSS frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    ├── public/
    │   └── manifest.json        # PWA manifest
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Route definitions
        ├── index.css            # Global Tailwind + custom styles
        ├── context/
        │   └── AuthContext.jsx  # Auth state + login/logout
        ├── services/
        │   └── api.js           # All axios API calls
        ├── components/
        │   ├── Layout/
        │   │   ├── Header.jsx        # Sticky header with nav + notifications
        │   │   └── AdminLayout.jsx   # Admin sidebar layout
        │   └── UI/
        │       └── index.jsx         # Shared UI: badges, modals, stats, alerts
        └── pages/
            ├── LandingPage.jsx       # Hero + branch cards + features
            ├── LoginPage.jsx         # Student/Admin login
            ├── RegisterPage.jsx      # Student registration
            ├── NotFoundPage.jsx      # 404 page
            ├── Resources/
            │   ├── ResourcesPage.jsx  # Branch → Sem → Subject picker
            │   ├── SubjectPage.jsx    # Unit list for a subject
            │   └── UnitPage.jsx       # Files for a unit (with PDF preview)
            ├── Upload/
            │   └── UploadPage.jsx    # File upload form with dropzone
            └── Dashboard/
                ├── StudentDashboard.jsx   # My uploads, status, notifications
                ├── AdminDashboard.jsx     # Stats + pending approvals
                ├── AdminResources.jsx     # All resources management table
                ├── AdminUsers.jsx         # User management
                ├── AdminAnalytics.jsx     # Charts: recharts bar + pie
                └── AdminLogs.jsx          # Access log table
```

---

## 🗄️ Database Schema

```
users               — id, full_name, email, enrollment_no, hashed_password, role, branch, semester
branches            — id, name, code, description
semesters           — id, number, branch_id
subjects            — id, name, code, semester_id
units               — id, number, title, subject_id
resources           — id, title, file_path, file_hash, content_type, status, unit_id, uploader_id
access_logs         — id, user_id, resource_id, action (view/download), ip_address, timestamp
notifications       — id, user_id, title, message, is_read, notification_type
```

### Content Types
- `notes` — Lecture notes
- `pyq` — Previous Year Questions
- `important_questions` — Important Questions
- `syllabus` — Syllabus

### Upload Status Flow
```
Student Uploads → PENDING → Admin Reviews → APPROVED (visible) or REJECTED (with reason)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

---

### ⚙️ Backend Setup

```bash
# 1. Navigate to backend
cd smart-college-hub/backend

# 2. Create virtual environment


# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env
# Edit .env with your settings (see below)

# 5. Seed initial data (branches, subjects, units, admin user)
python seed_data.py

# 6. Start the server
uvicorn main:app --reload --port 8000
```

**Backend runs at:** `http://localhost:8000`
**API Docs (Swagger):** `http://localhost:8000/docs`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd smart-college-hub/frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

### 🔑 Default Admin Credentials

```
Email:    admin@gpcwaidhan.ac.in
Password: Admin@123
```
> ⚠️ Change these in production via the `.env` file.

---

## 🌍 Environment Variables (`.env`)

```env
# Database (SQLite default — change to PostgreSQL for production)
DATABASE_URL=sqlite:///./college_hub.db
# PostgreSQL example:
# DATABASE_URL=postgresql://user:password@localhost/college_hub

# JWT Security
SECRET_KEY=your-very-long-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# Admin defaults (used in seed_data.py)
ADMIN_EMAIL=admin@gpcwaidhan.ac.in
ADMIN_PASSWORD=Admin@123

# College info
COLLEGE_NAME=Government Polytechnic College Waidhan
UNIVERSITY_NAME=RGPV University
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login (returns JWT token) |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update profile |

### Academic Structure
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/academic/branches` | List all branches |
| GET | `/api/academic/branches/{id}/semesters` | Get semesters for branch |
| GET | `/api/academic/semesters/{id}/subjects` | Get subjects for semester |
| GET | `/api/academic/subjects/{id}/units` | Get units for subject (with resource count) |
| GET | `/api/academic/units/{id}` | Get single unit |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resources/upload` | Upload file (multipart/form-data) |
| GET | `/api/resources/unit/{unit_id}` | Get approved resources for unit |
| GET | `/api/resources/{id}/download` | Download file (logs access) |
| POST | `/api/resources/{id}/view` | Log a view |
| GET | `/api/resources/my/uploads` | My uploaded files |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/pending` | Pending approval queue |
| PUT | `/api/admin/resources/{id}/approve` | Approve or reject resource |
| GET | `/api/admin/all-resources` | All resources (filterable) |
| DELETE | `/api/admin/resources/{id}` | Delete resource |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/{id}` | Update user |
| GET | `/api/admin/analytics/top-subjects` | Most viewed subjects |
| GET | `/api/admin/analytics/top-contributors` | Top uploaders |
| GET | `/api/admin/analytics/top-files` | Most downloaded files |
| GET | `/api/admin/analytics/access-logs` | Full access log |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | Get my notifications |
| PUT | `/api/notifications/{id}/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

---

## 🔒 Security Features

- **JWT Authentication** — All protected routes require `Bearer <token>` header
- **Role-based access** — Admin routes only accessible by admin users
- **File validation** — Only PDF, JPG, PNG, DOC, DOCX allowed
- **File size limit** — Configurable via `MAX_FILE_SIZE_MB` env var
- **Duplicate detection** — SHA-256 hash prevents re-uploading same file
- **Safe filenames** — Files stored with timestamp prefix to avoid collisions
- **CORS** — Configured for localhost dev; restrict in production

---

## 🐘 PostgreSQL (Production)

```bash
# 1. Create database
createdb college_hub

# 2. Update .env
DATABASE_URL=postgresql://postgres:password@localhost/college_hub

# 3. Re-run seed
python seed_data.py
```

---

## 🏗️ Production Build

```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/dist/

# Serve frontend with nginx and proxy /api to uvicorn
# OR use FastAPI to serve the built frontend

# Backend production run
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📱 PWA Installation

The frontend is configured as a Progressive Web App. Students can:
1. Open the site in Chrome/Edge on mobile
2. Tap "Add to Home Screen"
3. Use it like a native app

---

## 🛣️ Roadmap / Future Additions

- [ ] Email notifications (SMTP integration)
- [ ] Subject-wise comment/Q&A section
- [ ] Admin can add subjects & units from dashboard
- [ ] Student rating/feedback on resources
- [ ] Bulk download as ZIP
- [ ] Search across all resources
- [ ] Dark mode

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| Charts | Recharts |
| File Upload | react-dropzone |
| HTTP Client | Axios |
| Toast Notifications | react-hot-toast |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy 2.0 |
| Auth | python-jose (JWT), passlib (bcrypt) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| File Storage | Local filesystem (UPLOAD_DIR) |
| Fonts | Google Fonts: Outfit + DM Sans |

---

## 👨‍🎓 Made For

**Government Polytechnic College Waidhan**
Singrauli, Madhya Pradesh
Affiliated to **RGPV University, Bhopal**

---

## 📝 License

MIT License — Free to use and modify.

---

> Built with ❤️ for students of GPC Waidhan
