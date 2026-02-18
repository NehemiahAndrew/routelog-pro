# RouteLog Pro 🚛

An enterprise-grade trucking route planner and **FMCSA Hours of Service (HOS)** compliance system. Plan trips with real road routes, automatic HOS-compliant stop scheduling, and generated ELD daily log sheets — all in one web application.

![RouteLog Pro](https://img.shields.io/badge/RouteLog-Pro-1E3A8A?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **Trip Planning** — Enter current location, pickup, dropoff, and cycle hours used
- **Real Road Routes** — Uses OSRM (free, open-source) for actual road-following routes
- **Interactive Map** — Leaflet map with route polyline, color-coded markers for start/pickup/dropoff/fuel/rest stops
- **HOS Compliance Engine** — Automatically applies FMCSA Part 395 rules:
  - 11-hour driving limit
  - 14-hour duty window
  - 30-minute break after 8 hours driving
  - 10-hour rest requirement
  - 70-hour/8-day cycle limit
- **ELD Daily Log Sheets** — Canvas-drawn FMCSA §395.8 Record of Duty Status with:
  - Horizontal duty status lines (Off Duty, Sleeper, Driving, On Duty)
  - Vertical transition lines between statuses
  - 24-hour grid with hour/quarter-hour marks
  - Per-day sheet navigation
- **Compliance Dashboard** — Visual progress bars for all HOS limits
- **Driver Settings** — Driver profile, carrier info, vehicle details
- **Dark Mode** — Full dark theme support with persistent toggle
- **Assumptions Applied**:
  - Property-carrying driver
  - Fuel stop every 1,000 miles
  - 1 hour for pickup/dropoff operations
  - Average speed: 55 mph

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 4.2, Django REST Framework, Python 3.11 |
| **Frontend** | React 18, Vite 5, React Router 6 |
| **Styling** | Tailwind CSS 3.4, dark mode (class strategy) |
| **Maps** | Leaflet.js (npm) + OpenStreetMap tiles |
| **Routing API** | OSRM (free, no API key needed) |
| **Geocoding** | Built-in US city database (100+ cities) |
| **ELD Rendering** | HTML Canvas (FMCSA-style drawn lines) |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Database** | SQLite (dev), configurable for PostgreSQL (prod) |
| **Production** | Gunicorn, WhiteNoise, Render (backend), Vercel (frontend) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+ 
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at **http://localhost:8000**

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

> The Vite dev server proxies `/api` requests to the Django backend automatically.

---

## 📁 Project Structure

```
RouteLog Pro/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile                 # Render deployment
│   ├── build.sh                 # Render build script
│   ├── routelog/                # Django project config
│   │   ├── settings.py          # Production-ready settings (env vars)
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── trips/                   # Main app
│       ├── models.py            # Trip & DriverProfile models
│       ├── views.py             # API views (generate_trip, CRUD)
│       ├── serializers.py       # DRF serializers
│       ├── route_engine.py      # 750+ line HOS route calculation engine
│       └── urls.py              # API URL routing
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vercel.json              # Vercel SPA rewrites
│   ├── vite.config.js           # Vite config + API proxy
│   └── src/
│       ├── App.jsx              # Root with TripContext + DarkModeContext
│       ├── api.js               # Axios API client (env-aware)
│       ├── index.css            # Tailwind + custom components
│       ├── components/
│       │   ├── Layout.jsx       # App shell
│       │   ├── Sidebar.jsx      # Navigation sidebar
│       │   └── Header.jsx       # Top header bar
│       └── pages/
│           ├── Dashboard.jsx    # Trip planning form + summary
│           ├── RouteOverview.jsx # Leaflet map + timeline
│           ├── ELDLogs.jsx      # Canvas-drawn ELD log sheets
│           ├── Compliance.jsx   # HOS compliance dashboard
│           └── Settings.jsx     # Driver profile + dark mode
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-trip/` | Generate a complete trip with route, timeline, and ELD logs |
| `GET` | `/api/trips/` | List all saved trips |
| `GET` | `/api/trips/{id}/` | Get trip details |
| `GET` | `/api/profile/` | Get driver profile |
| `PUT` | `/api/profile/{id}/` | Update driver profile |

### Generate Trip Request Body
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Indianapolis, IN",
  "dropoff_location": "Los Angeles, CA",
  "current_cycle_used": 10
}
```

---

## 🌐 Deployment

### Backend (Render)
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `./build.sh`
4. Start command: `gunicorn routelog.wsgi:application`
5. Set environment variables:
   - `DJANGO_SECRET_KEY` — a strong random string
   - `DEBUG` — `False`
   - `ALLOWED_HOSTS` — your Render domain
   - `CORS_ALLOWED_ORIGINS` — your Vercel frontend URL

### Frontend (Vercel)
1. Import your repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Framework preset: **Vite**
4. Set environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://routelog-api.onrender.com`)

---

## 📄 License

Built for the Spotter Full Stack Developer Assessment.
