# 🚀 Deployment Guide — Smart College Resource Hub

## Option 1: Docker (Recommended — Easiest)

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose

```bash
# Clone / unzip the project
cd smart-college-hub

# Start everything (DB + Backend + Frontend)
docker-compose up --build

# First run seeds the database automatically
# Access at: http://localhost
# Admin: admin@gpcwaidhan.ac.in / Admin@123
```

**To stop:**
```bash
docker-compose down
```

**To stop and delete data:**
```bash
docker-compose down -v
```

---

## Option 2: Manual Setup (Development)

### Linux / Mac
```bash
chmod +x start.sh
./start.sh
```

### Windows
```bat
start.bat
```

### Manual steps
```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit .env as needed
python seed_data.py             # Seed DB + create admin
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Option 3: VPS / Cloud (Production)

### 1. Setup PostgreSQL
```bash
sudo apt install postgresql
sudo -u postgres createuser college_user -P
sudo -u postgres createdb college_hub -O college_user
```

### 2. Backend (Systemd service)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt psycopg2-binary gunicorn

# Edit .env — set PostgreSQL URL + strong SECRET_KEY
nano .env

# Seed database
python seed_data.py

# Create systemd service
sudo nano /etc/systemd/system/college-hub.service
```

**/etc/systemd/system/college-hub.service:**
```ini
[Unit]
Description=College Hub FastAPI
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/smart-college-hub/backend
Environment="PATH=/home/ubuntu/smart-college-hub/backend/venv/bin"
ExecStart=/home/ubuntu/smart-college-hub/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable college-hub
sudo systemctl start college-hub
```

### 3. Frontend Build
```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

### 4. Nginx (serves frontend + proxies API)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /home/ubuntu/smart-college-hub/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 15M;
    }

    location /files/ {
        proxy_pass http://127.0.0.1:8000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Free Hosting Options

| Service | What to host | Notes |
|---------|-------------|-------|
| **Railway.app** | Backend (FastAPI) | Free tier, Postgres add-on available |
| **Vercel** | Frontend (React) | Free, excellent CDN |
| **Render.com** | Backend + Postgres | Free tier available |
| **Fly.io** | Full stack | Free tier with Docker |

### Railway Quick Deploy (Backend)
1. Push to GitHub
2. New Project → Deploy from GitHub → select `backend/` folder
3. Add PostgreSQL plugin
4. Set environment variables from `.env.example`
5. Done! Get your deployment URL

### Vercel Quick Deploy (Frontend)
1. Push to GitHub  
2. Import project on vercel.com
3. Set root to `frontend/`
4. Add env var: `VITE_API_URL=https://your-railway-backend.up.railway.app`
5. Update `vite.config.js` proxy to point to Railway URL

---

## Environment Variables Checklist

```env
✅ DATABASE_URL        — PostgreSQL URL for production
✅ SECRET_KEY          — Long random string (min 32 chars)
✅ ADMIN_EMAIL         — Change from default
✅ ADMIN_PASSWORD      — Change from default (strong password)
✅ MAX_FILE_SIZE_MB    — Adjust as needed (default: 10)
✅ UPLOAD_DIR          — Absolute path to uploads folder
```

---

## Security Checklist Before Going Live

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Change default admin email and password
- [ ] Set `CORS` origins to your specific domain only (in `main.py`)
- [ ] Enable HTTPS (SSL)
- [ ] Set up regular database backups
- [ ] Move `uploads/` to cloud storage (S3/Cloudinary) for scalability
- [ ] Set rate limiting on API

---

## Backup & Restore

```bash
# Backup PostgreSQL
pg_dump -U college_user college_hub > backup_$(date +%Y%m%d).sql

# Restore
psql -U college_user college_hub < backup_20240101.sql

# Backup uploads folder
tar -czf uploads_backup.tar.gz uploads/
```
