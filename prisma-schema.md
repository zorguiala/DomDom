# Prisma schema for Simplified ERP (MongoDB)

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////
enum Role {
  ADMIN
  SALES
  INVENTORY
  HR
}

enum PurchaseStatus {
  DRAFT
  CONFIRMED
  RECEIVED
}

enum SaleType {
  DOOR_TO_DOOR
  CLASSIC
}

enum SaleStatus {
  QUOTE
  CONFIRMED
  DELIVERED
}

enum ProductionStatus {
  PLANNED
  IN_PROGRESS
  DONE
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
}

////////////////////////////////////////////////////
// Core Authentication
////////////////////////////////////////////////////
model User {
  id            String   @id @default(auto()) @map("_id")
  email         String   @unique
  passwordHash  String
  name          String?
  role          Role     @default(ADMIN)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

////////////////////////////////////////////////////
// Master Data
////////////////////////////////////////////////////
model Product {
  id             String   @id @default(auto()) @map("_id")
  name           String
  sku            String   @unique
  category       String?
  unit           String
  priceSell      Decimal  @db.Decimal(10,2)
  priceCost      Decimal  @db.Decimal(10,2)
  qtyOnHand      Decimal  @db.Decimal(14,3)     // kept updated via StockMovement
  minQty         Decimal? @db.Decimal(14,3)
  isRawMaterial  Boolean  @default(false)
  isFinishedGood Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  bomComponents  BomComponent[]           // if used in BOMs
  purchaseItems  PurchaseItem[]
  saleItems      SaleItem[]
  stockMoves     StockMovement[]
}

////////////////////////////////////////////////////
// Inventory & Manufacturing
////////////////////////////////////////////////////
model BomComponent {
  id            String  @id @default(auto()) @map("_id")
  bomId         String
  bom           BillOfMaterials @relation(fields: [bomId], references: [id])
  productId     String
  product       Product @relation(fields: [productId], references: [id])
  quantity      Decimal @db.Decimal(14,3)
  unit          String
}

model BillOfMaterials {
  id          String          @id @default(auto()) @map("_id")
  name        String
  description String?
  finalProductId String
  finalProduct Product         @relation(fields: [finalProductId], references: [id])
  components  BomComponent[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductionOrder {
  id          String   @id @default(auto()) @map("_id")
  bomId       String
  bom         BillOfMaterials @relation(fields: [bomId], references: [id])
  quantity    Decimal  @db.Decimal(14,3)
  status      ProductionStatus @default(PLANNED)
  startedAt   DateTime?
  finishedAt  DateTime?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

////////////////////////////////////////////////////
// Purchasing
////////////////////////////////////////////////////
model Purchase {
  id          String         @id @default(auto()) @map("_id")
  supplierName String
  refNo       String?
  date        DateTime
  status      PurchaseStatus @default(DRAFT)
  totalAmount Decimal        @db.Decimal(14,2)
  notes       String?
  items       PurchaseItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PurchaseItem {
  id         String   @id @default(auto()) @map("_id")
  purchaseId String
  purchase   Purchase @relation(fields: [purchaseId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Decimal  @db.Decimal(14,3)
  price      Decimal  @db.Decimal(10,2)
  total      Decimal  @db.Decimal(14,2)
}

////////////////////////////////////////////////////
// Sales
////////////////////////////////////////////////////
model Sale {
  id            String      @id @default(auto()) @map("_id")
  customerName  String?
  customerContact String?
  saleType      SaleType    @default(CLASSIC)
  refNo         String?
  date          DateTime
  status        SaleStatus  @default(QUOTE)
  totalAmount   Decimal     @db.Decimal(14,2)
  salespersonId String?
  salesperson   User?       @relation(fields: [salespersonId], references: [id])
  vanId         String?
  notes         String?
  items         SaleItem[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SaleItem {
  id        String   @id @default(auto()) @map("_id")
  saleId    String
  sale      Sale     @relation(fields: [saleId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Decimal  @db.Decimal(14,3)
  price     Decimal  @db.Decimal(10,2)
  total     Decimal  @db.Decimal(14,2)
}

////////////////////////////////////////////////////
// HR & Payroll
////////////////////////////////////////////////////
model Employee {
  id         String   @id @default(auto()) @map("_id")
  name       String
  position   String?
  contact    String?
  baseSalary Decimal  @db.Decimal(14,2)
  joinDate   DateTime
  active     Boolean  @default(true)
  attendances Attendance[]
  salaries   Salary[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Attendance {
  id         String   @id @default(auto()) @map("_id")
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id])
  date       DateTime
  checkIn    DateTime?
  checkOut   DateTime?
  status     AttendanceStatus @default(PRESENT)
  notes      String?
  createdAt  DateTime @default(now())
}

model Salary {
  id          String   @id @default(auto()) @map("_id")
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  month       Int
  year        Int
  gross       Decimal  @db.Decimal(14,2)
  deductions  Json?
  bonuses     Json?
  net         Decimal  @db.Decimal(14,2)
  paid        Boolean  @default(false)
  paidAt      DateTime?
  createdAt   DateTime @default(now())
}

////////////////////////////////////////////////////
// Expenses
////////////////////////////////////////////////////
model Expense {
  id          String   @id @default(auto()) @map("_id")
  category    String
  amount      Decimal  @db.Decimal(14,2)
  date        DateTime
  description String?
  paymentMethod String?
  reference   String?
  createdAt   DateTime @default(now())
}

////////////////////////////////////////////////////
// Stock Movement (Audit trail)
////////////////////////////////////////////////////
model StockMovement {
  id          String   @id @default(auto()) @map("_id")
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  date        DateTime @default(now())
  quantity    Decimal  @db.Decimal(14,3) // positive = in, negative = out
  reason      String   // e.g. "Purchase", "Sale", "Production Consume", "Production Output", "Adjustment"
  referenceId String?  // link back to PurchaseItem, SaleItem, etc. (store corresponding id)
}
