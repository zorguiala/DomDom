-- CreateTable
CREATE TABLE "van_sales_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" TEXT NOT NULL,
    "driverName" TEXT,
    "vehicleNumber" TEXT,
    "departureTime" DATETIME,
    "returnTime" DATETIME,
    "totalProductsOut" REAL NOT NULL,
    "totalProductsSold" REAL NOT NULL,
    "totalReturned" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "van_sales_operations_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sale_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "deliveredQty" REAL NOT NULL DEFAULT 0,
    "returnedQty" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sale_items" ("deliveredQty", "id", "productId", "qty", "saleId", "totalPrice", "unitPrice") SELECT "deliveredQty", "id", "productId", "qty", "saleId", "totalPrice", "unitPrice" FROM "sale_items";
DROP TABLE "sale_items";
ALTER TABLE "new_sale_items" RENAME TO "sale_items";
CREATE TABLE "new_sales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CLASSIC',
    "clientId" TEXT,
    "commercialId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUOTE',
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" DATETIME,
    "totalAmount" REAL NOT NULL,
    "notes" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "tva" REAL NOT NULL DEFAULT 0,
    "timbre" REAL NOT NULL DEFAULT 0,
    "exitSlipNumber" TEXT,
    "exitSlipDate" DATETIME,
    "returnDate" DATETIME,
    "returnedAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sales_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_commercialId_fkey" FOREIGN KEY ("commercialId") REFERENCES "commercials" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sales" ("clientId", "commercialId", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryDate", "id", "notes", "orderDate", "saleDate", "saleNumber", "status", "totalAmount", "type", "updatedAt") SELECT "clientId", "commercialId", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryDate", "id", "notes", "orderDate", "saleDate", "saleNumber", "status", "totalAmount", "type", "updatedAt" FROM "sales";
DROP TABLE "sales";
ALTER TABLE "new_sales" RENAME TO "sales";
CREATE UNIQUE INDEX "sales_saleNumber_key" ON "sales"("saleNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "van_sales_operations_saleId_key" ON "van_sales_operations"("saleId");
