# Simplified ERP System – Project Plan  
*(File : **erp-system-plan.md**)*  

---

## 1. Goal & Scope
Build an in-house, lighter-weight alternative to Odoo that covers just the processes the company needs today:

| Domain | Needed features |
|--------|-----------------|
| Inventory | real-time stock, simple transfers |
| Production | Bill Of Materials, automatic raw-material deduction & finished-goods creation |
| Purchasing | raise & receive PO, update stock |
| Sales | ① Door-to-door daily van sales ② Classic quotation → confirmation → invoice → delivery |
| HR / Payroll | attendance capture, month-end salary run |
| Expenses | ad-hoc spend recording |

Initial users: Owner (full), 1 stock/production clerk, 1 salesperson (sales-only).

---

## 2. Architecture

```
Client (Next.js app)
│
├─ Presentation layer  (React components, shadcn/ui, TailwindCSS)
│
├─ Front-end state     (React-Query/SWR, Zustand)
│
├─ API Routes          (/app/api/* — tRPC/REST handlers)
│          │
│          └─ Business Logic Layer
│                 • Services (InventoryService, SalesService …)
│                 • Domain events (StockMoved, ProductionDone …)
│
└─ Data Layer          (Prisma ORM ↔ MongoDB Atlas)
```

Cross-cutting utilities  
• AuthN / AuthZ: NextAuth.js + RBAC middleware  
• Validation: Zod schemas shared FE/BE  
• Audit & logging: Winston + Mongo collection  

Deployment target: Docker → VPS or Vercel (Front) + Render/Atlas (DB).

---

## 3. Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Front-end | Next.js 14 (App Router), React 18 | Fast dev, SSR, API routes |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent UI |
| State / Data | React Query (TanStack) | Cache & mutations |
| Auth | NextAuth.js (Credentials + Email) | Simple, extensible |
| API | Next.js API handlers / tRPC | Typed end-to-end |
| ORM | Prisma 5 (mongodb provider) | Schema in code, migrations |
| DB | MongoDB (Atlas or self-host) | Fits flexible ERP doc models |
| Dev tools | TypeScript, ESLint, Prettier, Jest, Playwright | Quality & tests |
| CI/CD | GitHub Actions → Vercel/Render | Automated delivery |

---

## 4. Data Model (MongoDB collections)

### 4.1 Products
```
{
  _id, name, sku, category, unit,
  priceSell, priceCost,
  qtyOnHand, minQty,
  isRawMaterial, isFinishedGood,
  createdAt, updatedAt
}
```

### 4.2 BillOfMaterials
```
{
  _id, name, description,
  finalProductId, components: [
       { productId, quantity, unit }
  ],
  createdAt, updatedAt
}
```

### 4.3 ProductionOrders
```
{
  _id, bomId, quantity,
  status: [planned|in_progress|done],
  startedAt, finishedAt,
  notes, createdAt, updatedAt
}
```

### 4.4 Purchases
```
{
  _id, supplierName, refNo, date,
  status: [draft|confirmed|received],
  items:[{ productId, qty, price, total }],
  totalAmount, createdAt, updatedAt
}
```

### 4.5 Sales
```
{
  _id, customerName?, saleType:[door2door|classic],
  vanId?, salespersonId?,
  refNo, date, status:[quote|confirmed|delivered],
  items:[{ productId, qty, price, total }],
  totalAmount, createdAt, updatedAt
}
```

### 4.6 Employees
```
{ _id, name, role, contact, baseSalary,
  joinDate, active, createdAt, updatedAt }
```

### 4.7 Attendance
```
{ _id, employeeId, date, checkIn, checkOut,
  status:[present|absent|half], notes }
```

### 4.8 Salaries
```
{ _id, employeeId, month, year,
  gross, deductions:[{reason,amount}],
  bonuses:[{reason,amount}],
  net, paid:boolean, paidAt }
```

### 4.9 Expenses
```
{ _id, category, amount, date, description,
  paymentMethod, ref }
```

### 4.10 Roles & Users
NextAuth `User` extended with `role` (`admin`, `sales`, `inventory`, `hr`).

---

## 5. Module Breakdown

### 5.1 Inventory
• CRUD Products  
• Stock overview & filters  
• Manual adjustment (reason logged)  
• Low-stock alerts (background job / cron)

### 5.2 BOM & Production
• Define BOM (UI builder)  
• Launch Production Order →  
  1. Check raw stock levels  
  2. Deduct multiples of BOM qty  
  3. Add finished product qty  
• Production status board

### 5.3 Purchasing
• Create Purchase Order  
• Receive & auto-increment stock  
• Supplier list & history

### 5.4 Sales
1. Door-to-Door  
   - Assign van + inventory load  
   - Mobile-friendly sell screen (offline cache)  
   - End-day reconciliation → variance report  
2. Classic Flow  
   - Quote → Confirm → Invoice (PDF) → Delivery  
   - Stock reserved & deducted on delivery

### 5.5 HR & Payroll
• Daily attendance punch (web/mobile)  
• Auto compute working days/month  
• Salary sheet generator (bonuses & deductions)  
• Mark salary paid, printable slip

### 5.6 Expenses
Simple form, category list, XLS/CSV export.

---

## 6. Implementation Road-map

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0** Setup | 1 wk | Repo, CI/CD, auth scaffold, RBAC |
| **1** Core Inventory | 2 wk | Product CRUD, stock moves, low-stock alert |
| **2** Purchases | 1 wk | PO creation, receiving, integrates with stock |
| **3** BOM & Production | 2 wk | BOM UI, production order, auto stock moves |
| **4** Sales Module | 3 wk | Door-to-door mobile view, classic sales flow |
| **5** HR Attendance | 2 wk | Employee CRUD, check-in/out, calendar view |
| **6** Payroll & Expenses | 2 wk | Salary calc, slips, expense tracker |
| **7** Reports & Polish | 1 wk | KPI dashboard, PDF/CSV exports, i18n |
| **8** UAT & Launch | 1 wk | Data migration, training, go-live |

*Total ≈ 14–15 weeks (single dev). Parallelize if multiple devs.*

---

## 7. Security, Quality & Ops

- **RBAC** middleware per route & component guard  
- Password hashing (bcrypt) + optional 2FA email link  
- Field-level validation (Zod & Prisma)  
- Unit & e2e tests (Jest + Playwright) – 80 % critical coverage  
- Backups: MongoDB Atlas daily snapshot  
- Logging & Monitoring: pino + Logtail / Grafana Cloud  
- Dockerised dev environment; staging & prod separated  
- License: code remains proprietary to company

---

## 8. Future Enhancements (Backlog)

1. Multi-warehouse & multi-currency  
2. Barcode / QR scanning for inventory & van sales  
3. Salesman GPS tracking & route optimisation  
4. Integration with accounting (QuickBooks API)  
5. Mobile app wrapper via React Native

---

*End of plan*
