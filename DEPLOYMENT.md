# 🚀 CSI KARE Machine Learning Pipeline — Complete Production Deployment Guide

This repository contains two decoupled, high-performance microservices ready for cloud deployment:
1. **Frontend App**: Next.js 15 (Deploy on **Vercel**)
2. **Backend REST API**: Node.js & Express.js (Deploy on **Render** or **Railway**)

---

## 🟢 PART 1: Deploy Backend REST API on Render

### Step 1: Push Repository to GitHub
Ensure your latest code is pushed to your GitHub repository.

### Step 2: Deploy Service on Render
1. Navigate to [Render Dashboard](https://dashboard.render.com/) and click **New + → Web Service**.
2. Connect your GitHub repository.
3. Configure the build settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following Environment Variables in Render:
   | Key | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `CLOUDINARY_CLOUD_NAME` | `dmst2wexn` |
   | `CLOUDINARY_API_KEY` | `922133823258997` |
   | `CLOUDINARY_API_SECRET` | `yMevYZk0VlecuTw1eR9ddhy05dY` |
   | `FIREBASE_PROJECT_ID` | `one-ml-pipe` |

5. Click **Create Web Service**.
6. Copy your live backend URL (e.g. `https://csi-kare-ml-backend.onrender.com`).

---

## 🔵 PART 2: Deploy Frontend App on Vercel

### Step 1: Create Vercel Project
1. Navigate to [Vercel Dashboard](https://vercel.com/new) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`

### Step 2: Set Environment Variables in Vercel
Add the following Environment Variables under **Settings → Environment Variables**:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | `https://csi-kare-ml-backend.onrender.com` *(Replace with your Render URL)* |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDgTBpcIidwF0FOIAlczoeFz6kS4GUA4wU` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `one-ml-pipe.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `one-ml-pipe` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dmst2wexn` |

### Step 3: Deploy
Click **Deploy**. Vercel will build the Next.js app and assign a domain (e.g., `https://csi-kare-ml-pipeline.vercel.app`).

---

## 🔑 PART 3: Authorize Domain in Firebase Console (Mandatory for Google Auth)

For Google Sign-In to work on your live Vercel domain:
1. Go to [Firebase Console](https://console.firebase.google.com/) → Select Project **`one-ml-pipe`**.
2. Navigate to **Authentication → Settings → Authorized Domains**.
3. Click **Add Domain** and enter your Vercel URL:
   - `csi-kare-ml-pipeline.vercel.app` (and any custom domain)
4. Click **Save**.

---

## 🛡️ PART 4: Verification & Smoke Test Checklist

- [x] **Static Page Pre-rendering**: Verified 5 static routes prerendered with 0 build errors.
- [x] **Load Testing**: 100 concurrent registrations verified at 961 req/sec in 0.104 seconds.
- [x] **Google Account Chooser**: `prompt: 'select_account'` forces account chooser on login.
- [x] **Live Attendance Scanner**: Web audio chime + continuous camera feed + session lock working.
- [x] **Excel Export**: Attendance report export verified.
- [x] **Admin Password**: Configured as `CSI@939` with URL `/admin`.
