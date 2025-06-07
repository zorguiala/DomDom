# SimpleERP – Lightweight Next.js + MongoDB ERP

SimpleERP is a lean, self-hosted alternative to heavyweight suites like Odoo.  
It focuses on the processes most small manufacturing & distribution companies need and nothing more.

## 🎯 Why SimpleERP?

* **Purpose-built** – only stock, production, sales, HR, purchases and expenses.
* **Modern stack** – Next.js 14 (App Router) + Prisma ORM + MongoDB.
* **Self contained** – single repository with full-stack TypeScript.
* **Fast to deploy** – run locally with `docker compose up` or on any Node host.

---

## ✨ Core Features

| Domain | What you get |
| ------ | ------------ |
| Stock Management | Real-time quantities, low-stock alerts, valuation |
| Bill of Materials | Define BOM, launch production; raw materials auto-deduct & finished goods auto-increment |
| Production Orders | Plan, start, complete, track status |
| Purchase | Simple PO → receive flow; receipt updates stock & cost price |
| Sales | ① Door-to-door daily van sales ② Classic Quote → Confirm → Invoice → Delivery |
| Employees & Payroll | Attendance punch-in/out; automatic monthly salary sheet |
| Expenses | Quick entry, categories, CSV/PDF export |
| Reports & Dashboards | Stock value, top sellers, profit, payroll cost |

---

## 🛠️ Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Front-end | Next.js 14, React 18, TailwindCSS & shadcn/ui |
| API | Next.js Route Handlers (tRPC) |
| Auth | NextAuth.js (Credentials + Email) |
| ORM | Prisma 5 (`mongodb` provider) |
| Database | MongoDB (local or Atlas) |
| Tests | Jest & Playwright |
| DevOps | Docker / GitHub Actions |

---

## 📁 Project Layout (high-level)

```
/app              ← Next.js pages, layouts & API routes
/components       ← Reusable UI widgets
/services         ← Server-side business logic
/prisma
  ├─ schema.prisma
  └─ migrations/
/scripts          ← Utility scripts & seeders
/docker           ← Dockerfile & compose
/tests            ← unit + e2e
```

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/your-org/simple-erp.git
cd simple-erp
```

### 2. Environment

Copy and adjust variables:

```bash
cp .env.example .env
# edit .env → DATABASE_URL="mongodb://localhost:27017/simpleerp"
```

### 3. Install Deps

```bash
pnpm install   # or npm / yarn
```

### 4. Database & Seed

```bash
pnpm prisma db push      # create collections
pnpm prisma db seed      # optional demo data
```

### 5. Run Dev Servers

```bash
pnpm dev                # runs next dev
```

Visit `http://localhost:3000`.

### 6. Docker One-liner (optional)

```bash
docker compose up -d
```

---

## 🏗️ Deployment

1. **MongoDB Atlas** – create cluster, update `DATABASE_URL`.
2. **Vercel / Render / Fly.io** – push repo & set env vars.
3. `pnpm build && pnpm start` serves optimized production build.

---

## 🤝 Contributing

Pull requests are welcome!  
Please read `CONTRIBUTING.md` (TBA) before submitting issues or PRs.

---

## 📄 License

MIT © 2025 Your Company
