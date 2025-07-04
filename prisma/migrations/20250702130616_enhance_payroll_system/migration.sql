/*
  Warnings:

  - You are about to drop the column `bonus` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `netPay` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payrolls` table. All the data in the column will be lost.
  - Added the required column `baseSalary` to the `payrolls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netSalary` to the `payrolls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalBaseSalary` to the `payrolls` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN "hoursPerWeek" REAL DEFAULT 40;
ALTER TABLE "employees" ADD COLUMN "overtimeRate" REAL DEFAULT 1.5;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payrolls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "baseSalary" REAL NOT NULL,
    "originalBaseSalary" REAL NOT NULL,
    "bonusesOrOvertime" TEXT,
    "deductions" TEXT,
    "netSalary" REAL NOT NULL,
    "regularHours" REAL,
    "overtimeHours" REAL,
    "workingDaysActual" REAL,
    "workingDaysStandard" REAL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_payrolls" ("createdAt", "deductions", "employeeId", "id", "month", "updatedAt", "year") SELECT "createdAt", "deductions", "employeeId", "id", "month", "updatedAt", "year" FROM "payrolls";
DROP TABLE "payrolls";
ALTER TABLE "new_payrolls" RENAME TO "payrolls";
CREATE UNIQUE INDEX "payrolls_employeeId_month_year_key" ON "payrolls"("employeeId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
