# ERP Application – Directory & File Structure
*(File: **app-structure.md**)*

```text
erp-app/
│
├─ app/                                # Next.js 14 “App Router” root
│   ├─ layout.tsx                      # Global layout (navbar, sidebar)
│   ├─ globals.css                     # Tailwind base styles
│   │
│   ├─ dashboard/                      # KPI & reports
│   │   ├─ page.tsx
│   │   └─ charts.tsx
│   │
│   ├─ auth/                           # Auth pages
│   │   ├─ login/page.tsx
│   │   ├─ register/page.tsx
│   │   └─ callback/route.ts           # NextAuth callback
│   │
│   ├─ inventory/                      # Stock management
│   │   ├─ layout.tsx
│   │   ├─ page.tsx                    # List view
│   │   ├─ create/page.tsx
│   │   └─ [id]/
│   │       ├─ page.tsx                # Detail
│   │       └─ edit/page.tsx
│   │
│   ├─ production/                     # BOM & Production Orders
│   │   ├─ layout.tsx
│   │   ├─ bom/
│   │   │   ├─ page.tsx
│   │   │   ├─ create/page.tsx
│   │   │   └─ [id]/edit/page.tsx
│   │   └─ orders/
│   │       ├─ page.tsx
│   │       ├─ create/page.tsx
│   │       └─ [id]/progress/page.tsx
│   │
│   ├─ purchases/
│   │   ├─ layout.tsx
│   │   ├─ page.tsx
│   │   ├─ create/page.tsx
│   │   └─ [id]/receipt/page.tsx
│   │
│   ├─ sales/
│   │   ├─ layout.tsx
│   │   ├─ page.tsx                    # Classic sales list
│   │   ├─ door-to-door/               # Van sales mode
│   │   │   ├─ start/page.tsx
│   │   │   └─ end/page.tsx
│   │   ├─ quote/create/page.tsx
│   │   └─ [id]/invoice/page.tsx
│   │
│   ├─ hr/
│   │   ├─ layout.tsx
│   │   ├─ employees/
│   │   │   ├─ page.tsx
│   │   │   ├─ create/page.tsx
│   │   │   └─ [id]/edit/page.tsx
│   │   ├─ attendance/
│   │   │   ├─ page.tsx
│   │   │   └─ punch/page.tsx
│   │   └─ payroll/
│   │       ├─ page.tsx
│   │       └─ [id]/slip/page.tsx
│   │
│   ├─ expenses/
│   │   ├─ layout.tsx
│   │   ├─ page.tsx
│   │   └─ create/page.tsx
│   │
│   ├─ settings/
│   │   ├─ page.tsx                    # Company, roles, preferences
│   │   └─ users/page.tsx
│   │
│   └─ api/                            # Route Handlers (tRPC/REST)
│       ├─ auth/[...nextauth]/route.ts
│       ├─ inventory/
│       │   ├─ route.ts                # CRUD dispatch
│       │   └─ low-stock/route.ts
│       ├─ production/
│       │   ├─ bom/route.ts
│       │   └─ orders/route.ts
│       ├─ purchases/route.ts
│       ├─ sales/route.ts
│       ├─ hr/
│       │   ├─ employees/route.ts
│       │   ├─ attendance/route.ts
│       │   └─ payroll/route.ts
│       └─ expenses/route.ts
│
├─ components/                         # Re-usable UI
│   ├─ ui/                             # shadcn/ui wrapped elements
│   ├─ tables/
│   ├─ forms/
│   ├─ modals/
│   └─ charts/
│
├─ services/                           # Business logic (server-only)
│   ├─ inventory.service.ts
│   ├─ production.service.ts
│   ├─ purchase.service.ts
│   ├─ sales.service.ts
│   ├─ hr.service.ts
│   └─ expense.service.ts
│
├─ prisma/
│   ├─ schema.prisma
│   ├─ seed.ts
│   └─ migrations/
│
├─ lib/                                # Helpers & utilities
│   ├─ auth.ts                         # getSession helpers
│   ├─ rbac.ts                         # role checking
│   ├─ validation.ts                   # zod schemas
│   ├─ pdf.ts                          # invoice & slip generation
│   └─ dates.ts
│
├─ hooks/                              # React custom hooks
│   ├─ useInventory.ts
│   ├─ useProduction.ts
│   ├─ usePurchase.ts
│   └─ ...
│
├─ middleware.ts                       # Next.js edge middleware (RBAC)
├─ .env.example
├─ next.config.js
├─ tailwind.config.ts
├─ tsconfig.json
│
├─ tests/
│   ├─ unit/
│   │   └─ inventory.test.ts
│   └─ e2e/
│       └─ sales-flow.spec.ts
│
├─ docker/
│   ├─ Dockerfile
│   └─ docker-compose.yml
│
├─ .github/workflows/
│   └─ ci.yml                          # Lint, test, build
│
├─ public/                             # Static assets (logo, icons)
├─ README.md
└─ package.json
```

### Notes
• **App Router grouping** keeps UI and API for each domain close together.  
• **services/** isolates domain logic for testability.  
• MongoDB migrations handled by Prisma `migrate`.  
• `middleware.ts` enforces authentication & role-based access at the edge.  
• Add more sub-files/folders as modules grow; keep feature-based structure.
