# Trinance CMS & Reader Platform

A production-grade, real-time financial editorial management system (CMS) and public-facing briefing website built using Node.js, Express, React, TypeScript, and PostgreSQL.

## 📂 Project Architecture

The project is structured into three clean, independent components:

1.  **`trinance-backend/`**: Consolidates database connection pool configurations, migrations, controllers, and resource routes. Implements a background scheduler daemon to transition scheduled briefings to live status.
2.  **`trinance-cms/`**: A modern editorial wizard containing a multi-step briefing creator (Basics, Layout, Content Builder, Access Hierarchy, Live Preview) with automated saves and audit trail logs.
3.  **`trinance-reader/`**: A public briefing reading site modeled after professional financial media. Includes premium visibility gating (Free, Monthly, Quarterly, Yearly subscriber hierarchy) and live-unlocking.

---

## ⚙️ Prerequisites & Database Setup

1.  **Node.js**: Ensure Node.js (v18+) is installed.
2.  **PostgreSQL**: Ensure a PostgreSQL instance is running on port `5432`.
3.  **Create Database**: Open pgAdmin 4 or the `psql` console and create a database named `trinance_cms`:
    ```sql
    CREATE DATABASE trinance_cms;
    ```
4.  **Environment Variables**: Create a `.env` file in `trinance-backend/` with your PostgreSQL credentials:
    ```env
    PORT=3000
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=
    DB_NAME=trinance_cms
    ```

---

## 🚀 Installation & Running

Follow these instructions to boot the backend database migrations/seeds and start the services:

### 1. Start the Backend API Server
Navigate to `trinance-backend/` to install dependencies, run migrations/seeding, and boot the server:
```bash
cd trinance-backend
npm install
npm run db:init   # Performs migrations and seeds demo data
npm run dev       # Starts backend API on port 3000
```

### 2. Start the CMS Editorial App
Navigate to `trinance-cms/` and start the frontend editor on port `5173`:
```bash
cd trinance-cms
npm install
npm run dev       # Starts CMS dashboard on port 5173
```

### 3. Start the Public Reader Website
Navigate to `trinance-reader/` and start the reader site on port `5174`:
```bash
cd trinance-reader
npm install
npm run dev       # Starts Reader site on port 5174
```

---

## 🧪 Real-Time Verification Flow

Keep both frontends open side-by-side:
1.  **Create and Edit**: Open the CMS ([http://localhost:5173](http://localhost:5173)), create a new newsletter, build its contents using visual charts/tables in Step 3, and save it. Any input typing is carets-preserved.
2.  **Immediate Publish**: Choose "Publish now" and submit. The briefing immediately displays on the Reader home grid ([http://localhost:5174](http://localhost:5174)) **within 3 seconds without refreshing the page**.
3.  **Future Scheduling**: Pick a release date 1 minute in the future. The post will stay hidden on the Reader homepage. Once the release time arrives, the backend scheduler transitions the status and the briefing **automatically unlocks** on the Reader UI.
4.  **Subscriber Tiers**: Gating restrictions enforce hierarchy checking:
    *   *Free* reads Free only.
    *   *Monthly* reads Free & Monthly.
    *   *Quarterly* reads Free, Monthly, and Quarterly.
    *   *Yearly* reads all tiers.
    *   Select your level using the **Member Level select dropdown** at the top right of the Reader navbar to test paywall triggers dynamically.
