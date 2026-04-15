# 🩸 Blood Bank — Complete Setup Guide
### Windows + Visual Studio Code + MongoDB Atlas

---

## PART 1 — Install Required Software

### Step 1 · Install Node.js

1. Open your browser and go to **https://nodejs.org**
2. Click the **"LTS"** (Long Term Support) button to download
3. Run the downloaded `.msi` installer
4. Click **Next → Next → Install** (keep all default options checked)
5. Click **Finish**

**Verify installation:**
> Press `Windows + R`, type `cmd`, press Enter. In the black window, type:
```
node --version
npm --version
```
Both should print a version number like `v20.x.x`. If they do, Node.js is installed correctly.

---

### Step 2 · Install Visual Studio Code

1. Go to **https://code.visualstudio.com**
2. Click **Download for Windows**
3. Run the installer, click **Next** through all steps
4. ✅ Make sure **"Add to PATH"** checkbox is ticked during install
5. Click **Install → Finish**

---

### Step 3 · Install Recommended VS Code Extensions

Open VS Code. On the left sidebar, click the **Extensions icon** (looks like 4 squares).

Search and install these one by one:

| Extension Name | Why You Need It |
|---|---|
| **ES7+ React/Redux Snippets** | React code shortcuts |
| **Prettier - Code Formatter** | Auto-formats your code neatly |
| **Thunder Client** | Test your API without Postman |
| **MongoDB for VS Code** | View your database inside VS Code |
| **GitLens** | Helpful for version tracking |

---

## PART 2 — Set Up MongoDB Atlas (Free Cloud Database)

### Step 4 · Create a Free MongoDB Atlas Account

1. Go to **https://www.mongodb.com/atlas**
2. Click **"Try Free"**
3. Sign up with your email (or use Google sign-in)
4. Fill in your details and click **Create your Atlas account**

---

### Step 5 · Create a Free Cluster

After logging in:

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier (the free forever option)
3. Select **AWS** as provider
4. Select **Mumbai (ap-south-1)** as region (closest to India)
5. Name your cluster: `BloodBankCluster`
6. Click **"Create Deployment"**

---

### Step 6 · Create a Database User

A popup will appear asking you to create a user:

1. **Username:** `bloodbank_user`
2. **Password:** Click **"Autogenerate Secure Password"** then copy the password and save it somewhere (Notepad)
3. Click **"Create Database User"**

---

### Step 7 · Allow Your IP Address

1. In the same popup, scroll down to **"Where would you like to connect from?"**
2. Click **"Add My Current IP Address"**
3. Click **"Finish and Close"**

> 💡 If you're on a college/office network, the IP may change. You can also click **"Allow Access from Anywhere"** and enter `0.0.0.0/0` for the IP — fine for an internship project.

---

### Step 8 · Get Your Connection String

1. On the Atlas dashboard, find your cluster and click **"Connect"**
2. Click **"Compass"** (or **"Drivers"**)
3. Select **"Drivers"**, choose **Node.js**, version **5.5 or later**
4. Copy the connection string. It looks like this:

```
mongodb+srv://bloodbank_user:<password>@bloodbankcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with the password you saved in Step 6

---

## PART 3 — Open and Configure the Project

### Step 9 · Extract the Project

1. Find the downloaded `blood-bank-project.zip` file
2. Right-click it → **"Extract All"**
3. Choose a location like `C:\Projects\blood-bank`
4. Click **Extract**

---

### Step 10 · Open in VS Code

1. Open **Visual Studio Code**
2. Click **File → Open Folder**
3. Navigate to `C:\Projects\blood-bank`
4. Click **"Select Folder"**

You will see the project files appear in the left sidebar.

---

### Step 11 · Open the Terminal in VS Code

Press `` Ctrl + ` `` (the backtick key, top-left of keyboard, below Escape)

A terminal panel will open at the bottom of VS Code. This is where you will type all commands.

---

### Step 12 · Configure the Backend Environment

In the VS Code terminal, type these commands one at a time, pressing Enter after each:

```bash
cd blood-bank
cd backend
```

Now create the `.env` file:

1. In the VS Code sidebar, expand `blood-bank → backend`
2. You will see a file called `.env.example`
3. Right-click it → **"Copy"**, then right-click the `backend` folder → **"Paste"**
4. Rename the pasted file to `.env` (remove `.example` from the name)
5. Open `.env` and replace its contents with:

```
MONGO_URI=mongodb+srv://bloodbank_user:YOUR_PASSWORD@bloodbankcluster.xxxxx.mongodb.net/bloodbank?retryWrites=true&w=majority
JWT_SECRET=punjab_bloodbank_secret_2024
PORT=5000
```

> Replace the `MONGO_URI` value with your actual connection string from Step 8.

---

## PART 4 — Install Dependencies

### Step 13 · Install Backend Packages

In the VS Code terminal (make sure you are in the `backend` folder):

```bash
npm install
```

Wait for it to finish. You will see a `node_modules` folder appear.

---

### Step 14 · Install Frontend Packages

In the same terminal, type:

```bash
cd ..
cd frontend
npm install
```

Wait for it to finish.

---

## PART 5 — Seed Sample Data

### Step 15 · Load Punjab Sample Data

In the terminal, go back to the backend folder:

```bash
cd ..
cd backend
node seed.js
```

You should see:

```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Created 5 staff accounts
🧑‍🤝‍🧑 Created 20 donors
🩸 Created 20 blood units
📋 Created 7 blood requests

✅ ─────────────────────────────────────────────────
   Sample data seeded successfully!
─────────────────────────────────────────────────────
   Login credentials:
   Admin         → admin / admin123
   Receptionist  → gurpreet / staff123
   Lab Technician→ amandeep / staff123
─────────────────────────────────────────────────────
```

---

## PART 6 — Run the Application

You need **two terminals** open at the same time — one for backend, one for frontend.

### Step 16 · Start the Backend

Click the **"+"** icon in the VS Code terminal panel to open a second terminal.

In Terminal 1:
```bash
cd blood-bank/backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

### Step 17 · Start the Frontend

In Terminal 2:
```bash
cd blood-bank/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 18 · Open the Application

Open your browser (Chrome recommended) and go to:

```
http://localhost:5173
```

You will see the **BloodBank login page**.

---

## PART 7 — Explore the Application

### Step 19 · Login & Explore Each Role

Try logging in with each account to see what each role can do:

| Role | Username | Password | What to explore |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Dashboard, Reports, Staff Accounts, all features |
| **Receptionist** | `gurpreet` | `staff123` | Register donors, raise blood requests |
| **Lab Technician** | `amandeep` | `staff123` | Record donations, manage inventory, fulfill requests |

---

### Step 20 · Sample Data Overview (Punjab)

The seed data creates a realistic Punjab blood bank scenario:

**👥 20 Donors from across Punjab:**
- 5 from Amritsar (Sultanwind, Lawrence Road, Ranjit Avenue...)
- 5 from Ludhiana (Sarabha Nagar, BRS Nagar, Model Town...)
- 4 from Jalandhar
- 3 from Patiala
- 3 from Mohali

**🩸 20 Blood Units with realistic statuses:**
- 13 units **Available** (different blood groups)
- 2 units **Issued** (already used for patients)
- 2 units **Discarded** (failed TTI test, damaged bag)
- ⚠️ **O- and AB-** are intentionally low stock to demonstrate the alert system

**📋 7 Blood Requests:**
- 4 **Pending** (including 2 emergencies)
- 2 **Fulfilled** (with issued units linked)
- 1 **Rejected** (with reason: insufficient stock)

**Hospitals referenced in data:**
DMCH Ludhiana · Fortis Mohali · Civil Hospital Amritsar · PGIMER Chandigarh · Amandeep Hospital · Max Hospital · Rajindra Hospital Patiala

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `node` is not recognized | Restart VS Code after installing Node.js |
| `npm install` fails | Make sure you are in the correct folder (`backend` or `frontend`) |
| MongoDB connection error | Check your `.env` file — make sure the password has no `<>` brackets |
| Port 5000 already in use | Open Task Manager → find node.exe → End Task, then restart |
| White screen in browser | Open browser console (F12) and check for errors |
| Seed script fails | Make sure backend `.env` is configured first and MongoDB Atlas is connected |

---

## Quick Reference — Daily Use

Every time you want to run the project:

```bash
# Terminal 1 — Backend
cd C:\Projects\blood-bank\backend
npm run dev

# Terminal 2 — Frontend  
cd C:\Projects\blood-bank\frontend
npm run dev

# Then open: http://localhost:5173
```

To re-seed fresh data at any time:
```bash
cd C:\Projects\blood-bank\backend
node seed.js
```
