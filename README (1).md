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

## Features

### Inventory Management
- Product creation and management
- Stock tracking and movements
- Low stock alerts
- Support for raw materials and finished goods

### Purchase Orders
- Create purchase orders with suppliers
- **Create new products directly while placing orders**
- Track order status (Draft, Confirmed, Received)
- Automatic inventory updates upon receipt

### Production Management
- Bill of Materials (BOM) creation
- Production order management
- Material requirement planning

### Sales Management
- Create sales orders
- Track customer information
- Monitor delivery status

### Human Resources
- Employee management
- Attendance tracking
- Payroll management

### Expense Management
- Track business expenses
- Categorize expenses
- Export reports

## How to Create Products During Purchase Orders

When creating a purchase order, you can add new products on-the-fly without leaving the page:

### Method 1: Using the Dropdown
1. **Start a new purchase order** by selecting a supplier
2. **Click "Add Item"** to add a line item
3. **Click in the Product field** - a dropdown will appear
4. **Type the name of a new product** that doesn't exist yet
5. **Look for the blue "+ Add new product" option** at the bottom of the dropdown
6. **Click on it** to open the product creation modal

### Method 2: Using the Quick Add Button
1. **Type a product name** in the product field
2. **Look for the blue "+" button** that appears on the right side of the input field
3. **Click the "+" button** to instantly create a new product

### Product Creation Modal
When the modal opens:
- **Name**: Pre-filled with what you typed
- **Unit**: Enter the unit of measurement (kg, pcs, box, etc.)
- **Product Type**: Automatically set to "Raw Material" for purchase orders
- **Click "Create Product"** to save

The new product will:
- Be automatically added to your purchase order line item
- Be created as a Raw Material (suitable for purchasing)
- Be available for future use in your inventory
- Have pricing that can be updated later in inventory management

### Tips for Success
- ✅ **Type the full product name** you want to create
- ✅ **Look for the blue text "Add new product"** in the dropdown
- ✅ **Use the "+" button** for quick access
- ✅ **Make sure to fill in the Unit field** (required)
- ❌ Don't select an existing product if you want to create a new one

### Troubleshooting
If you don't see the "Add new product" option:
1. Make sure you've typed a product name that doesn't already exist
2. Check that the dropdown is open (click in the field)
3. Look for the blue "+" button on the right side of the input
4. Ensure you're not selecting an existing product from the list

---

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Database Schema
The system uses Prisma ORM with PostgreSQL. Key models include:
- User (authentication and authorization)
- Product (inventory items)
- Purchase/PurchaseItem (purchase orders)
- Sale/SaleItem (sales orders)
- BOM/BomComponent (bill of materials)
- ProductionOrder (manufacturing orders)

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Magic UI
- **State Management**: React Query (TanStack Query)

### Contributing
1. Follow the coding standards in the workspace rules
2. Use React Query for all data fetching
3. Place data hooks in `data/` subfolders
4. Write unit tests for new features
5. Use Magic UI components for consistent design
