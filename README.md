# 🩸 Blood Bank Management System

A full-stack internship project built with **React + Node.js + MongoDB**.

---

## Project Structure

```
blood-bank/
├── backend/          ← Express + MongoDB API
└── frontend/         ← React (Vite) UI
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`)
- npm

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env        # Edit MONGO_URI and JWT_SECRET if needed
npm run dev                 # Starts on http://localhost:5000
```

### 2. Seed the Admin Account

After the backend starts, run this **once** in your terminal or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/seed-admin
```

This creates:
- **Username:** `admin`
- **Password:** `admin123`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

Open **http://localhost:5173** and log in with `admin / admin123`.

---

## 👥 Roles & Permissions

| Feature              | Admin | Receptionist | Lab Technician |
|----------------------|-------|--------------|----------------|
| Dashboard            | ✅    | ✅           | ✅             |
| Add / Search Donors  | ✅    | ✅           | ✅             |
| Record Donation      | ✅    | ✅           | ✅             |
| View Inventory       | ✅    | ✅           | ✅             |
| Discard Blood Units  | ✅    | ❌           | ✅             |
| Raise Blood Request  | ✅    | ✅           | ✅             |
| Fulfill / Reject Req | ✅    | ❌           | ✅             |
| Reports              | ✅    | ❌           | ❌             |
| Manage Staff         | ✅    | ❌           | ❌             |

---

## 🗃️ API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Login                    |
| POST   | /api/auth/seed-admin              | Create initial admin     |
| POST   | /api/auth/register                | Create staff (admin only)|
| GET    | /api/donors                       | List / search donors     |
| POST   | /api/donors                       | Register donor           |
| GET    | /api/donors/:id                   | Donor + history          |
| PUT    | /api/donors/:id                   | Update donor             |
| DELETE | /api/donors/:id                   | Delete donor             |
| GET    | /api/blood-units                  | All blood units          |
| GET    | /api/blood-units/inventory-summary| Stock by blood group     |
| POST   | /api/blood-units                  | Record donation          |
| PATCH  | /api/blood-units/:id/discard      | Discard unit             |
| GET    | /api/requests                     | All requests             |
| POST   | /api/requests                     | Raise request            |
| PATCH  | /api/requests/:id/fulfill         | Fulfill request          |
| PATCH  | /api/requests/:id/reject          | Reject request           |
| GET    | /api/dashboard                    | Dashboard stats          |
| GET    | /api/dashboard/report?from=&to=   | Date range report        |

---

## 🛠 Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT + bcryptjs

---

## 📌 Future Enhancements (mention in report)

- SMS/WhatsApp donor notifications
- Blood donation camp scheduling
- NACO/SBTC compliance reports
- TTI test result recording
- Export to PDF/Excel
