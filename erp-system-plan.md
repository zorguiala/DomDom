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
└─ Data Layer          (Prisma ORM ↔ SQLite [Initially MongoDB Atlas])
```

Cross-cutting utilities  
• AuthN / AuthZ: NextAuth.js + RBAC middleware  `[PARTIAL - Frontend sign-in UI done, Backend NextAuth setup assumed]`
• Validation: Zod schemas shared FE/BE `[DONE - Used in new APIs]`
• Audit & logging: Winston + Mongo collection `[TODO]`

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
| ORM | Prisma 5 (SQLite provider [Initially MongoDB]) | Schema in code, migrations |
| DB | SQLite (Initially MongoDB Atlas) | Fits flexible ERP doc models, simpler for dev |
| Dev tools | TypeScript, ESLint, Prettier, Jest, Playwright | Quality & tests |
| CI/CD | GitHub Actions → Vercel/Render | Automated delivery |

---

## 4. Data Model (Prisma Schema with SQLite)

### 4.1 Products
```prisma
model Product {
  // ... (as per schema.prisma)
  qtyOnHand      Float    @default(0) // Example
}
```
*(Note: Data models now reflect Prisma schema with SQLite. Original JSON syntax was for MongoDB.)*

### 4.2 BillOfMaterials
```prisma
model BillOfMaterials {
  // ... (as per schema.prisma)
}
```

### 4.3 ProductionOrders
```prisma
model ProductionOrder {
  // ... (as per schema.prisma)
  qtyProduced     Float    @default(0)
  // status: PLANNED, IN_PROGRESS, DONE, CANCELLED
}
```

### 4.4 Purchases
```prisma
model Purchase {
  // ... (as per schema.prisma)
}
```

### 4.5 Sales
```prisma
model Sale {
  // ... (as per schema.prisma)
}
```

### 4.6 Employees
```prisma
model Employee {
  // ... (as per schema.prisma)
  salary     Float? // Base salary
  hireDate   DateTime
}
```

### 4.7 Attendance
```prisma
model Attendance {
  // ... (as per schema.prisma)
  // status: PRESENT, ABSENT, HALF_DAY
  // No explicit checkIn/checkOut, uses daily status and optional hoursWorked.
}
```

### 4.8 Salaries (Payroll)
```prisma
model Payroll {
  // ... (as per schema.prisma)
  baseSalary         Float // Pro-rata or original, context needed
  originalBaseSalary Float? // Added for clarity
  bonusesOrOvertime  String?  // JSON String: [{reason: string, amount: Float}]
  deductions         String?  // JSON String: [{reason: string, amount: Float}]
  paid               Boolean  @default(false)
  paidAt             DateTime?
}
```

### 4.9 Expenses
```prisma
model Expense {
  // ... (as per schema.prisma)
  paymentMethod String? // Added
}
```

### 4.10 Roles & Users
NextAuth `User` model in Prisma schema. `role` field on `User` model.

---

## 5. Module Breakdown

### 5.1 Inventory
• CRUD Products `[ASSUMED BASELINE - No specific tasks done]`
• Stock overview & filters `[ASSUMED BASELINE - No specific tasks done]`
• Manual adjustment (reason logged) `[ASSUMED BASELINE - No specific tasks done]`
• Low-stock alerts (background job / cron) `[TODO - Requires background processing]`

### 5.2 BOM & Production
• Define BOM (UI builder) `[DONE - CRUD UI & API]`
• Launch Production Order → `[DONE - API logic for stock implemented]`
  1. Check raw stock levels `[DONE - Implemented in API]`
  2. Deduct multiples of BOM qty `[DONE - Implemented in API]`
  3. Add finished product qty `[DONE - Implemented in API]`
• Production status board `[DONE - Enhanced list page with progress bars]`

### 5.3 Purchasing
• Create Purchase Order `[ASSUMED BASELINE - No specific tasks done]`
• Receive & auto-increment stock `[ASSUMED BASELINE - No specific tasks done]`
• Supplier list & history `[ASSUMED BASELINE - No specific tasks done]`

### 5.4 Sales
1. Door-to-Door `[ASSUMED BASELINE - No specific tasks done]`
   - Assign van + inventory load
   - Mobile-friendly sell screen (offline cache)
   - End-day reconciliation → variance report
2. Classic Flow `[ASSUMED BASELINE - No specific tasks done]`
   - Quote → Confirm → Invoice (PDF) → Delivery
   - Stock reserved & deducted on delivery

### 5.5 HR & Payroll
• Employee CRUD `[DONE - UI & API implemented]`
• Daily attendance punch (web/mobile) `[PARTIAL - UI & API for daily status (Present, Absent, Half-day) and optional hours. Specific check-in/check-out times not implemented. Mobile UI not specifically addressed.]`
• Auto compute working days/month `[DONE - API endpoint created, uses daily status.]`
• Salary sheet generator (bonuses & deductions) `[DONE - API for generation and update, UI for management. Payroll model uses String? for itemized adjustments due to SQLite JSON limitations.]`
• Mark salary paid, printable slip `[DONE - API and UI to mark paid & set date. Basic printable slip view in UI.]`

### 5.6 Expenses
• Simple form `[DONE - UI & API for CRUD]`
• Category list `[PARTIAL - Category is a free-text field. No separate management UI for categories.]`
• XLS/CSV export `[DONE - API and UI button for export.]`
• `paymentMethod` field added to schema, UI, and API.

---

## 6. Implementation Road-map

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0** Setup | 1 wk | Repo, CI/CD, auth scaffold, RBAC `[PARTIAL - Auth sign-in UI updated, NextAuth.js backend setup assumed pre-existing or out of scope for these tasks. RBAC not directly addressed.]` |
| **1** Core Inventory | 2 wk | Product CRUD, stock moves, low-stock alert `[ASSUMED BASELINE - No specific tasks on this module recently. Low-stock alert likely pending.]` |
| **2** Purchases | 1 wk | PO creation, receiving, integrates with stock `[ASSUMED BASELINE - No specific tasks on this module recently.]` |
| **3** BOM & Production | 2 wk | BOM UI, production order, auto stock moves `[DONE - BOM CRUD UI & API. Production Order CRUD UI & API with stock deduction/addition logic. Status board enhancements.]` |
| **4** Sales Module | 3 wk | Door-to-door mobile view, classic sales flow `[ASSUMED BASELINE - No specific tasks on this module recently.]` |
| **5** HR Attendance | 2 wk | Employee CRUD, check-in/out, calendar view `[DONE - Employee CRUD UI & API. Attendance recording (daily status) UI & API. Working days calculation API. Calendar view not implemented.]` |
| **6** Payroll & Expenses | 2 wk | Salary calc, slips, expense tracker `[DONE - Payroll generation API, Payroll management UI (list, detail/edit with itemized adjustments, mark paid, printable slip view). Expense CRUD UI & API, CSV export. Schema updated for itemized adjustments (as JSON string) and payment method.]` `Note: Prisma tooling issues (pnpm environment) caused significant delays but were eventually circumvented for schema updates.`|
| **7** Reports & Polish | 1 wk | KPI dashboard, PDF/CSV exports, i18n `[PARTIAL - CSV export for Expenses done. Internationalization (i18n) setup for new features done. KPI dashboard and PDF exports are pending.]` |
| **8** UAT & Launch | 1 wk | Data migration, training, go-live `[TODO]` |

*Total ≈ 14–15 weeks (single dev). Parallelize if multiple devs.*
*(Note: Timeline might be affected by initial Prisma/pnpm tooling issues encountered and resolved.)*

---

## 7. Security, Quality & Ops

- **RBAC** middleware per route & component guard `[TODO - Not directly addressed in recent tasks]`
- Password hashing (bcrypt) + optional 2FA email link `[ASSUMED BASELINE - NextAuth setup]`
- Field-level validation (Zod & Prisma) `[DONE - Implemented in all new API routes and forms]`
- Unit & e2e tests (Jest + Playwright) – 80 % critical coverage `[TODO - No tests written in recent tasks]`
- Backups: MongoDB Atlas daily snapshot `[N/A - Switched to SQLite for dev]`
- Logging & Monitoring: pino + Logtail / Grafana Cloud `[TODO]`
- Dockerised dev environment; staging & prod separated `[TODO]`
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
