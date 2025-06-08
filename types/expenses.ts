// Assuming 'Expense' is the Prisma model type.
// If prisma generate could run, we'd import it:
// import { Expense as PrismaExpense } from "@prisma/client";

// For now, let's define what we expect PrismaExpense to be, including the new field.
export interface PrismaExpense {
  id: string;
  description: string;
  category: string;
  amount: number; // Float in Prisma maps to number
  expenseDate: Date; // DateTime in Prisma maps to Date
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  id?: string; // For editing
  description: string;
  category: string;
  amount: number;
  expenseDate: string; // Expecting YYYY-MM-DD string from date picker for forms
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
}

// For displaying expenses, potentially with more details or transformations
export type ExpenseWithDetails = PrismaExpense; // Can be expanded later
