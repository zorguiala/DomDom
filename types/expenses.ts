export interface Expense {
  id: string;
  description: string;
  categoryId: string;
  totalAmount: number;
  paidAmount: number;
  type: "ONE_TIME" | "RECURRING" | "LOAN";
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  expenseDate: Date;
  dueDate?: Date | null;
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
  // Recurring fields
  isRecurring: boolean;
  recurringFreq?: "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  nextDueDate?: Date | null;
  lastGenerated?: Date | null;
  recurringEndDate?: Date | null;
  originalExpenseId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpensePayment {
  id: string;
  expenseId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  description: string;
  categoryId: string;
  totalAmount: number;
  paidAmount?: number;
  type?: "ONE_TIME" | "RECURRING" | "LOAN";
  expenseDate: string;
  dueDate?: string | null;
  paymentMethod?: string | null;
  receipt?: string | null;
  notes?: string | null;
  // Recurring fields
  isRecurring?: boolean;
  recurringFreq?: "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  nextDueDate?: string | null;
  recurringEndDate?: string | null;
}

export interface PaymentFormData {
  amount: number;
  paymentDate: string;
  paymentMethod?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export type ExpenseWithCategory = Expense & {
  category: {
    id: string;
    name: string;
  };
};

export type ExpenseWithPayments = ExpenseWithCategory & {
  payments: ExpensePayment[];
};