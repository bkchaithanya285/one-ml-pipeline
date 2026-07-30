# CSI KARE - ONE COMPLETE MACHINE LEARNING PIPELINE

Futuristic AI-powered event registration platform and admin management portal built for **CSI KARE Student Chapter (CLAIM GROUP 3)**.

---

## 📁 Repository Structure

```text
ONE MACHINE LEARNING AI/
├── 📁 frontend/              <-- Next.js 15 App Router (Deploy on Vercel)
│   ├── app/                  (Landing Page, Hero, Admin Dashboard, API routes)
│   ├── components/           (Particles, Robots, Monitor, Countdown, Forms)
│   ├── lib/                  (API Client, Firebase & Cloudinary helpers)
│   ├── public/               (CSI Logo)
│   ├── types/                (TypeScript Interfaces)
│   ├── .env.local            (Frontend Environment Variables)
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── 📁 backend/               <-- Express REST API Server (Deploy on Render)
│   ├── .env                  (Backend Environment Variables)
│   ├── firestore.rules       (Firebase Security Rules)
│   ├── package.json
│   ├── README.md             (Backend Setup Guide)
│   └── server.js             (Express.js REST API Server)
│
└── 📄 DEPLOYMENT.md          <-- Step-by-step Vercel & Render Deployment Guide
```

---

## 🚀 Running Locally

### 1. Run Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Run Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Production

- **Backend (Render)**: Deploy the `backend/` directory to Render.
- **Frontend (Vercel)**: Deploy the `frontend/` directory to Vercel and point `NEXT_PUBLIC_BACKEND_URL` to your Render URL.

See [DEPLOYMENT.md](file:///c:/Users/bkris/Downloads/ONE%20MACHINE%20LEARNING%20AI/DEPLOYMENT.md) for step-by-step screenshots & instructions.
