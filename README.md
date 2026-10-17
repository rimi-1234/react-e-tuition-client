# 🎓 React E-Tuition Platform

A full-stack MERN application designed to streamline the connection between students and tutors. This platform allows students to post tuition needs, tutors to apply for jobs, and facilitates secure payment processing for tuition bookings via Stripe.

### 🔗 Live Links

| Component | Status | URL |
| :--- | :--- | :--- |
| **Frontend (Client)** | 🟢 Live | **[https://react-e-tution-session-client.vercel.app](https://react-e-tution-session-client.vercel.app/)** |
| **Backend (Server)** | 🟢 Live | **[https://react-e-tution-session-sever.vercel.app](https://react-e-tution-session-sever.vercel.app/)** |

---

## 🎯 Purpose

The **React E-Tuition Platform** was built to solve the inefficiency of finding reliable academic tutors. In many areas, the process is manual and disorganized. This platform solves that by providing:

1.  **Trust & Verification:** A centralized marketplace where verified tutors can find work.
2.  **Secure Transactions:** Eliminates payment risks by integrating **Stripe** for secure booking fees.
3.  **Role-Based Access:** Distinct, optimized workflows for Students (hiring), Tutors (applying), and Admins (managing).

---

## ✨ Key Features

* **🔐 Authentication:** Secure login & registration using **Firebase** (Google & Email/Password).
* **🛡️ Role-Based Access Control (RBAC):**
    * **Students:** Post tuition jobs, manage applications, book tutors.
    * **Tutors:** Browse jobs, filter by subject/class, apply for positions.
    * **Admins:** Manage users, verify tutors, oversee platform activity.
* **💳 Secure Payments:** Integrated **Stripe Payment Gateway** (supports BDT currency) for booking confirmations.
* **📄 Tuition Management:** Full CRUD (Create, Read, Update, Delete) capabilities for tuition posts.
* **⚡ Real-time Data:** Powered by **TanStack Query** for efficient data fetching and caching.

---

## 📦 Packages Used

### **💻 Client-Side (Frontend)**
* **Framework:** `react`, `react-router-dom` (Vite)
* **Styling:** `tailwindcss`, `daisyui`
* **State & API:** `@tanstack/react-query`, `axios`
* **Authentication:** `firebase`
* **Payment:** `@stripe/react-stripe-js`, `@stripe/stripe-js`
* **UI Components:** `sweetalert2`, `react-hot-toast`, `react-icons`

### **⚙️ Server-Side (Backend)**
* **Runtime:** `node`, `express`
* **Database:** `mongodb` (Native Driver)
* **Authentication:** `firebase-admin`
* **Security:** `cors`, `dotenv`, `jsonwebtoken` (JWT)
* **Payment:** `stripe` (Backend SDK)
* **Development:** `nodemon`

---

## Theme

The theme control is in the navbar, dashboard sidebar, login, and sign up. Light and dark are saved in the browser. If you have not chosen one, the app follows the device theme and updates when the device theme changes. Refresh and in-app navigation keep the same choice.

## Modern features to choose

See [MODERN_FEATURES.md](../MODERN_FEATURES.md) for features that are not built yet. Check the ones you want implemented.

## Run locally

### Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in MongoDB, Stripe, Firebase Admin, and `CLIENT_URL`. Then:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the API origin, for example `http://localhost:3000`. Then:

```bash
npm run dev
```

## Deploy

### Frontend on Vercel

1. Import this repository in Vercel.
2. Set the root directory to `frontend`.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_API_URL` (your Render or Vercel API origin) and `VITE_IMAGE_HOST_KEY`.
5. `frontend/vercel.json` rewrites client routes to the app so refresh works on `/tutors`, `/dashboard`, and other paths.

### API on Render

1. Create a Web Service with root directory `backend`.
2. Build command: `npm install`. Start command: `npm start`.
3. Health check path: `/health`.
4. Set `MONGO_USER`, `MONGO_PASS`, `STRIPE_SECRET_KEY`, `FB_SERVICE_KEY`, and `CLIENT_URL` (the Vercel site URL).

`render.yaml` in the repository root is the same service as a Blueprint.

### API on Vercel

Create a second Vercel project with root directory `backend`. `backend/vercel.json` routes requests to the Express app. Set the same environment variables as Render, and allow MongoDB Atlas connections from anywhere (`0.0.0.0/0`) because Vercel does not use a fixed IP. Set `CLIENT_URL` to the frontend origin so Stripe return URLs and CORS match that site.
