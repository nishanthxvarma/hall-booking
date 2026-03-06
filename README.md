# 🏛️ Smart Hall Booking and Faculty Approval System

A full-stack web application for college hall booking with faculty approval workflow, built with **React + Tailwind CSS** frontend and **Node.js + Express + MongoDB** backend.

## ✨ Features

- **User Registration & Login** — Students and faculty can create accounts and log in (like Instagram)
- **Club Dashboard** — Summary cards, calendar view, and recent bookings
- **Book a Hall** — Select hall, date, time slot with real-time availability checking
- **My Bookings** — Tabbed view (All/Pending/Approved/Rejected) with colored status badges
- **Faculty Dashboard** — One-click Approve/Reject/Suggest Changes system
- **Manage Halls** — Faculty can add halls with custom time slots
- **Automated PDF** — Generates approval letter with QR code on booking approval
- **Conflict Prevention** — Database-level prevention of double bookings

---

## 🚀 Quick Start (Step-by-Step)

### Prerequisites

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **MongoDB** — [Download Community Server](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)

### Step 1: Clone / Navigate to the project

```bash
cd anti-hall
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables (optional - defaults work for local MongoDB)
# Edit .env file if your MongoDB is on a different URL:
#   MONGODB_URI=mongodb://localhost:27017/smart-hall-booking
#   JWT_SECRET=your_secret_key
#   PORT=5000

# Start the backend server
npm run dev
```

The backend will start at **http://localhost:5000**

### Step 3: Setup Frontend (in a new terminal)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start at **http://localhost:5173**

### Step 4: Open in Browser

Go to **http://localhost:5173** and you're ready!

---

## 📋 How to Use

### First Time Setup

1. **Register as Faculty** — Create a faculty account to manage halls
2. **Add Halls** — Go to "Manage Halls" and add halls with time slots (e.g., "9:00 AM - 11:00 AM")
3. **Register as Student** — Create a student/club account
4. **Book a Hall** — Select hall, date, time slot, and submit
5. **Faculty Approves** — Faculty reviews and approves/rejects from their dashboard
6. **Download PDF** — After approval, students can download the permission letter with QR code

### User Roles

| Role | Features |
|------|----------|
| **Student / Club** | Book halls, track bookings, download approval PDFs |
| **Faculty / Admin** | Approve/reject bookings, manage halls, add time slots |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| PDF | PDFKit + QRCode |

---

## 📁 Project Structure

```
anti-hall/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Hall.js            # Hall schema
│   │   └── Booking.js         # Booking schema (with compound index)
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Profile
│   │   ├── halls.js           # CRUD for halls
│   │   └── bookings.js        # Bookings + availability + PDF
│   ├── utils/pdfGenerator.js  # PDF generation with QR code
│   ├── server.js              # Express entry point
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/axios.js       # Axios with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/        # Navbar, Calendar, StatusBadge, etc.
│   │   ├── pages/             # All page components
│   │   ├── App.jsx            # Router
│   │   └── index.css          # Tailwind + custom styles
│   └── ...
└── README.md
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile

### Halls
- `GET /api/halls` — List all halls
- `POST /api/halls` — Add hall (faculty)
- `PUT /api/halls/:id` — Update hall (faculty)
- `DELETE /api/halls/:id` — Delete hall (faculty)

### Bookings
- `POST /api/bookings` — Submit booking request
- `GET /api/bookings` — List bookings
- `GET /api/bookings/stats` — Dashboard stats
- `GET /api/bookings/availability` — Check availability
- `PUT /api/bookings/:id/status` — Approve/reject (faculty)
- `GET /api/bookings/:id/pdf` — Download approval PDF
