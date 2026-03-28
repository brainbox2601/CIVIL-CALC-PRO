# CivilCalc Pro — Engineering Calculator Suite

A full-stack civil engineering calculation platform with 7 interactive calculators,
user authentication, saved history, and graphical outputs.

---

## 📁 Project Structure

```
civilcalc-pro/
│
├── index.html              ← Full frontend (React + Chart.js via CDN)
│
├── backend/
│   ├── server.js           ← Express API (auth + calculations)
│   ├── package.json
│   └── .env                ← Environment variables (see below)
│
└── README.md
```

For a proper React project structure (recommended for production):

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── PageHeader.jsx
│   │   ├── Calculators/
│   │   │   ├── BeamCalc.jsx
│   │   │   ├── ConcreteMix.jsx
│   │   │   ├── LoadCalc.jsx
│   │   │   ├── SoilCalc.jsx
│   │   │   ├── ColumnCalc.jsx
│   │   │   ├── UnitConverter.jsx
│   │   │   └── AreaVolume.jsx
│   │   ├── Charts/
│   │   │   └── ChartCanvas.jsx
│   │   └── History/
│   │       └── HistoryPage.jsx
│   ├── hooks/
│   │   └── useHistory.js
│   └── utils/
│       ├── formulas.js     ← All engineering formulas
│       └── storage.js      ← LocalStorage utils
└── package.json
```

---

## ⚙️ Calculators Included

| Calculator | Code Reference | Key Formula |
|---|---|---|
| Beam Deflection & Analysis | IS 456 | δ = PL³/48EI (SS) |
| Concrete Mix Design | IS 456:2000 | Nominal mix M10–M40 |
| Load Calculations | IS 875 + IS 1893 | Wu = 1.5(DL+LL) |
| Soil Bearing Capacity | Terzaghi 1943 | qu = cNc + qNq + 0.5γBNγ |
| RC Column Design | IS 456:2000 | Pu = 0.4fckAc + 0.67fyAst |
| Unit Converter | — | 50+ engineering units |
| Area & Volume | — | 8 geometric shapes |

---

## 🚀 Deployment Guide

### Frontend — Netlify (Free)

1. Push `index.html` (or your React build) to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Set build command: `npm run build` (if using React CRA)
4. Set publish directory: `build/`
5. Click Deploy — live URL in ~60 seconds

```bash
# Or via CLI
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Frontend — Vercel (Free)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Backend — Render ($7/month or free tier)

1. Push `backend/` folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
5. Add environment variables (see below)
6. Deploy

### Backend — Railway (Alternative)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Database — MongoDB Atlas (Free 512MB)

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free M0 cluster (AWS/Nigeria region)
3. Database Access → Add user (username + password)
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string

---

## 🔐 Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/civilcalc
JWT_SECRET=your_super_secret_key_change_this_in_production
FRONTEND_URL=https://your-netlify-app.netlify.app
```

---

## 📡 API Endpoints

```
POST   /api/auth/register          → Create account
POST   /api/auth/login             → Sign in, returns JWT
GET    /api/auth/me                → Current user (requires auth)

POST   /api/calculations           → Save calculation
GET    /api/calculations           → Get history (paginated)
DELETE /api/calculations/:id       → Delete entry
GET    /api/calculations/stats     → Activity summary

POST   /api/calculate/beam         → Server-side beam calc
GET    /api/health                 → Health check
```

---

## 🛠️ Running Locally

```bash
# Backend
cd backend
npm install
npm run dev         # Runs on http://localhost:5000

# Frontend
# Open index.html directly in browser
# Or serve with:
npx serve . -p 3000
```

---

## 📐 Formula References

- **IS 456:2000** — Plain and Reinforced Concrete Code of Practice
- **IS 875:Part 1** — Dead Loads
- **IS 875:Part 2** — Imposed (Live) Loads
- **IS 875:Part 3** — Wind Loads
- **IS 1893:2016** — Criteria for Earthquake Resistant Design
- **Terzaghi (1943)** — Theoretical Soil Mechanics
- **IS 6403** — Determination of Bearing Capacity of Shallow Foundations

---

## 👤 Author

Built by **Nuhu Abdulbasit Dolapo** — Full Stack Developer
