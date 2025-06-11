"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, Receipt, CreditCard, TrendingDown, AlertTriangle, Download } from "lucide-react"; // Added Download
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PrismaExpense } from "@/types/expenses";

export default function ExpensesPage() {
  const t = useTranslations("expenses");
  const common = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();

  const [expenses, setExpenses] = useState<PrismaExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("errorFetchingExpenses"));
      }
      setExpenses(await res.json());
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: t("errorFetchingExpensesTitle"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      fetchExpenses(); // Refresh list
    } catch (err: any) {
      toast({ variant: "destructive", title: t("errorDeletingExpenseTitle"), description: err.message });
    }
  };

  // Function to format currency, can be moved to a utils file
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

      {/* Expenses Overview Cards (Static for now as per instructions) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpenses")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div> {/* Static */}
            <p className="text-xs text-muted-foreground">This month</p> {/* Static */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pending")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div> {/* Static */}
            <p className="text-xs text-muted-foreground">Awaiting approval</p> {/* Static */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("avgExpense")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$285</div> {/* Static */}
            <p className="text-xs text-muted-foreground">Per transaction</p> {/* Static */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overBudget")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div> {/* Static */}
            <p className="text-xs text-muted-foreground">{common("categories")}</p> {/* Static */}
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentExpenses")}</CardTitle>
          <CardDescription>{t("recentExpensesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-4">{common("loading")}</p>}
          {error && !loading && <p className="text-destructive text-center py-4">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("expenseDateField")}</TableHead>
                  <TableHead>{t("descriptionField")}</TableHead>
                  <TableHead>{t("categoryField")}</TableHead>
                  <TableHead className="text-right">{t("amountField")}</TableHead>
                  <TableHead>{t("paymentMethodField")}</TableHead>
                  <TableHead className="text-center">{common("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t("noExpensesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={expense.description}>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{expense.paymentMethod || common("na")}</TableCell>
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
