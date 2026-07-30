# CSI KARE Machine Learning Pipeline - Express REST API Backend

Node.js & Express REST API Backend designed for single-click deployment on **Render** (or Railway / Heroku / AWS).

## 🚀 How to Deploy Backend on Render

1. Create a new GitHub repository for `backend/` or push this folder to your GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub Repository.
4. Set the following parameters:
   - **Name**: `csi-kare-ml-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the Environment Variables:
   - `PORT`: `5000`
   - `CLOUDINARY_CLOUD_NAME`: `dmst2wexn`
   - `CLOUDINARY_API_KEY`: `922133823258997`
   - `CLOUDINARY_API_SECRET`: `yMevYZk0VlecuTw1eR9ddhy05dY`
   - `FIREBASE_PROJECT_ID`: `one-ml-pipe`
6. Click **Create Web Service**.
7. Copy your deployed Render URL (e.g. `https://csi-kare-ml-backend.onrender.com`).

---

## 📡 REST API Endpoints

- `GET /api/health` - Server health monitor
- `POST /api/cloudinary/sign` - SHA-1 Cloudinary Upload Signature
- `GET /api/registrations` - Fetch all registration records
- `POST /api/registrations` - Create a new student registration record
- `PUT /api/registrations/:id/status` - Approve / Reject registration
- `DELETE /api/registrations/:id` - Delete registration record
- `GET /api/settings` - Fetch event configuration settings
- `PUT /api/settings` - Update event settings
