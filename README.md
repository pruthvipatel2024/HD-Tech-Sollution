# HD Tech Solutions - Decoupled Multi-Service Monorepo

This repository contains the production-ready commercial website and management system for **HD Tech Solutions**, architected into a fully decoupled monorepo containing a **Next.js 15 Frontend** and an **Express.js Backend API**.

---

## 🛠️ Architecture Overview

```
           [ Next.js 15 Frontend ]  (Deployed on Vercel)
                     │
                     ▼ (REST HTTP Requests via Fetch API Client with HTTP-Only Cookies)
         [ Express.js Node Backend ] (Deployed on Render)
            │                  │
            ▼                  ▼
 [ Neon PostgreSQL DB ]  [ Cloudinary API ] (Image Storage)
```

- **Frontend (`/frontend`)**: Built with Next.js 15, React 19, Tailwind CSS v4, and Framer Motion. Communicates exclusively with the backend via REST endpoints. **Contains zero Prisma references or database credentials.**
- **Backend (`/backend`)**: Built with Express.js, TypeScript, Node.js, and Prisma ORM. Handles JWT security, role authorizations, Zod request validations, and structured logging via Winston.
- **Database (Neon)**: Normalized PostgreSQL database tables tracking inventory, inquiries, project logs, cms page copy, and admin credentials.
- **Storage (Cloudinary)**: Asynchronously stores uploaded inquiry screenshots, product pictures, and showcase images (falls back to local filesystem streaming in local development if credentials are empty).

---

## ⚙️ Environment Configuration

Copy [.env.example](file:///d:/HD%20Sollutions/.env.example) to create the configuration templates in their respective directories:

### Frontend Environment Variables (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend Environment Variables (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password123@localhost:5432/hd_tech_solutions?sslmode=disable
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional, falls back to local server filesystem if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 Local Development Setup

### 1. Boot up Local Database (Optional)
If you don't have PostgreSQL installed locally, launch the pre-configured container using Docker Compose:
```bash
docker compose up -d
```

### 2. Configure & Seed Backend
Move into the backend directory, install packages, generate the Prisma Client, run migrations, and seed data:
```bash
cd backend
npm install

# Generate Client bindings
npx prisma generate

# Apply migrations to database
npx prisma migrate dev --name init

# Seed default settings, inventory, and admin credentials
npm run db:seed
```
*Default Seeded Admin Account:*
- **Username:** `admin`
- **Password:** `admin123`

### 3. Launch Services
Run the backend API and Next.js frontend client dev servers in separate terminal sessions:

**Backend Server (Runs on port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Client (Runs on port 3000):**
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the homepage or visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs) to view the interactive API swagger documentation.

---

## 🚀 Production Deployment

### Backend Deploying to Render
1. Connect your Github repository to **Render**.
2. Select **Web Service** and choose the root folder as `backend`.
3. Set the **Build Command** to:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
4. Set the **Start Command** to:
   ```bash
   npx prisma migrate deploy && npm start
   ```
5. Bind your database string (`DATABASE_URL`), `CLIENT_URL` (your frontend Vercel domain), and Cloudinary keys under Environment Variables.

### Frontend Deploying to Vercel
1. Connect your Github repository to **Vercel**.
2. Select the `frontend` folder as the root directory of the Vercel project.
3. Configure the Framework Preset to **Next.js**.
4. Add the Environment Variable `NEXT_PUBLIC_API_URL` pointing to your deployed Render API (e.g. `https://your-backend.onrender.com/api`).
5. Vercel will automatically build and serve the optimized application.
