'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Receipt, CreditCard, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetExpenses } from './data/use-get-expenses/use-get-expenses';

export default function ExpensesPage() {
  const t = useTranslations('expenses');
  const common = useTranslations('common');
  const { toast } = useToast();
  const router = useRouter();

  const { data: expenses = [], isLoading: loading, error, refetch: fetchExpenses } = useGetExpenses();

  const handleDelete = async (expenseId: string) => {
    if (!confirm(t("confirmDeleteExpense") || "Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || t("errorDeletingExpense"));
      }
      toast({
        title: t("expenseDeletedTitle") || "Expense Deleted",
        description: t("expenseDeletedDesc") || "The expense has been successfully deleted.",
      });
      fetchExpenses();
    } catch (err: any) {
      toast({ variant: "destructive", title: t("errorDeletingExpenseTitle"), description: err.message });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/expenses/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("addExpense")}
            </Button>
          </Link>
          <Button asChild variant="outline">
            <a href="/api/expenses/export" download={`expenses-${new Date().toISOString().split('T')[0]}.csv`}>
              <Download className="mr-2 h-4 w-4" />
              {t("exportToCsv") || "Export to CSV"}
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpenses")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.totalAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? t("expense") : t("expenses")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPaid")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.paidAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.status === 'PAID').length} {t("expenseStatus.paid")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("outstanding")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenses.reduce((sum, expense) => sum + (expense.totalAmount - expense.paidAmount), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.status === 'UNPAID' || e.status === 'PARTIALLY_PAID').length} {t("pending")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overdue")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.filter(e => e.dueDate && new Date(e.dueDate) < new Date() && e.status !== 'PAID').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("upcomingDue")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentExpenses")}</CardTitle>
          <CardDescription>{t("recentExpensesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-4">{common("loading")}</p>}
          {error && !loading && <p className="text-destructive text-center py-4">{error.message}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("expenseDateField")}</TableHead>
                  <TableHead>{t("descriptionField")}</TableHead>
                  <TableHead>{t("typeField")}</TableHead>
                  <TableHead>{t("statusField")}</TableHead>
                  <TableHead className="text-right">{t("totalAmountField")}</TableHead>
                  <TableHead className="text-right">{t("paidAmountField")}</TableHead>
                  <TableHead className="text-center">{common("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t("noExpensesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={expense.description}>{expense.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          expense.type === 'LOAN' ? 'bg-red-50 text-red-700' : 
                          expense.type === 'RECURRING' ? 'bg-blue-50 text-blue-700' : 
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {t(`expenseTypes.${expense.type.toLowerCase()}`)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          expense.status === 'PAID' ? 'bg-green-50 text-green-700' : 
                          expense.status === 'PARTIALLY_PAID' ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-red-50 text-red-700'
                        }`}>
                          {t(`expenseStatus.${expense.status.toLowerCase()}`)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-right">
                          <div>{formatCurrency(expense.paidAmount)}</div>
                          {expense.totalAmount > expense.paidAmount && (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(expense.totalAmount - expense.paidAmount)} {t("outstanding")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{common("openMenu")}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{common("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/expenses/${expense.id}`)}>
                              {common("view")}
                            </DropdownMenuItem>
                            {expense.status !== 'PAID' && (
                              <DropdownMenuItem onClick={() => router.push(`/expenses/${expense.id}/payment`)}>
                                {t("makePayment")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
                              {common("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700 dark:focus:text-red-50"
                            >
                              {common("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
