export interface Expense {
  id: string;
  description: string;
  categoryId: string;
  amount: number;
  expenseDate: Date;
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  description: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
}

export type ExpenseWithCategory = Expense & {
  category: {
    id: string;
    name: string;
  };
};