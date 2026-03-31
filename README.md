# 🏥 NexCare — Hospital Management System

A full-stack Hospital Management System built with **Java (Javalin)** for the backend and **React (Vite)** for the frontend, with a **MySQL** database.

---

## 📁 Project Structure

```
hospital-management-system/
├── backend/          ← Java + Javalin REST API
│   ├── src/
│   ├── pom.xml
│   ├── .env          ← DB credentials (not committed)
│   └── .env.example  ← Template for setup
│
├── frontend/         ← React + Vite UI
│   ├── src/
│   │   ├── api/      ← Centralized API client
│   │   └── components/
│   ├── .env          ← API URL (not committed)
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18, Vite, CSS3          |
| Backend  | Java 17, Javalin 6, Maven     |
| Database | MySQL 8                       |
| Config   | dotenv-java, Vite env vars    |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8 running on port 3306

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials

# Run with Maven
../apache-maven-3.9.6/bin/mvn clean compile exec:java
```

Backend runs at: **http://localhost:7000**

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env if backend is on a different port

npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Default Doctor Accounts

| Doctor       | Email                     | ID | Password   |
|--------------|---------------------------|----|------------|
| Dr. Smith    | smith@hospital.com        | 1  | admin123   |
| Dr. Adams    | adams@hospital.com        | 2  | admin123   |
| Dr. Johnson  | johnson@hospital.com      | 3  | admin123   |

---

## ✨ Features

- **Dual-role auth** — Patient (Name + Mobile) | Doctor (ID + Email + Password)
- **Appointment scheduling** with doctor specialization and problem declaration
- **24-hour cancellation policy** — locked if appointment is within 24 hours
- **Auto-generated billing** on every appointment booking
- **Pay-now functionality** for patients
- **Doctor notifications** when new appointments are booked
- **Patient directory** visible to doctors only

---

## 🗃️ Database Schema

Tables: `patients`, `doctors`, `appointments`, `billing`
