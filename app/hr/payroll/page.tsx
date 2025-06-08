"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { PayrollData, PayrollGenerationRequest } from "@/types/hr";
import { Employee } from "@prisma/client";
import { ArrowRight, FileCog, FilterX, Search } from "lucide-react";
import Link from "next/link";

const currentYear = new Date().getFullYear();

// Schema for payroll generation form
const payrollGenerationSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(currentYear - 10).max(currentYear + 5), // Year range
  standardWorkingDaysInput: z.coerce.number().positive().optional().nullable(),
});

type PayrollGenerationFormValues = z.infer<typeof payrollGenerationSchema>;

// Schema for payroll list filters
const payrollFilterSchema = z.object({
  filterMonth: z.coerce.number().int().min(1).max(12).optional().nullable(),
  filterYear: z.coerce.number().int().min(currentYear - 10).max(currentYear + 5).optional().nullable(),
  filterEmployeeId: z.string().optional().nullable(),
});

type PayrollFilterFormValues = z.infer<typeof payrollFilterSchema>;

export default function PayrollPage() {
  const t = useTranslations("hr");
  const common = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();

  const [payrolls, setPayrolls] = useState<PayrollData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingPayrolls, setLoadingPayrolls] = useState(false);
  const [generationSummary, setGenerationSummary] = useState<string | null>(null);

  // Form for Payroll Generation
  const generationForm = useForm<PayrollGenerationFormValues>({
    resolver: zodResolver(payrollGenerationSchema),
    defaultValues: {
      month: new Date().getMonth() + 1, // Default to current month
      year: currentYear,
      standardWorkingDaysInput: undefined, // e.g. 22
    },
  });

  // Form for Payroll Filters
  const filterForm = useForm<PayrollFilterFormValues>({
    resolver: zodResolver(payrollFilterSchema),
    defaultValues: {
      filterMonth: new Date().getMonth() + 1,
      filterYear: currentYear,
      filterEmployeeId: "",
    },
  });

  // Fetch employees for filter dropdown
  useEffect(() => {
    fetch("/api/hr/employees")
      .then((res) => res.json())
      .then(setEmployees)
      .catch(() => toast({ variant: "destructive", title: common("error"), description: t("errorFetchingEmployees") }));
  }, [toast, common, t]);

  // Fetch Payrolls based on filters
  const fetchPayrolls = async (filters: PayrollFilterFormValues) => {
    setLoadingPayrolls(true);
    setGenerationSummary(null); // Clear generation summary when fetching
    try {
      const queryParams = new URLSearchParams();
      if (filters.filterMonth) queryParams.append("month", String(filters.filterMonth));
      if (filters.filterYear) queryParams.append("year", String(filters.filterYear));
      if (filters.filterEmployeeId) queryParams.append("employeeId", filters.filterEmployeeId);

      const res = await fetch(`/api/hr/payroll?${queryParams.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("errorFetchingPayrolls"));
      }
      setPayrolls(await res.json());
    } catch (err: any) {
      toast({ variant: "destructive", title: common("error"), description: err.message });
    } finally {
      setLoadingPayrolls(false);
    }
  };

  // Initial fetch and fetch on filter change
  useEffect(() => {
    const subscription = filterForm.watch((value, { name, type }) => {
      if (type === 'change') { // Fetch when any filter field changes
        fetchPayrolls(value as PayrollFilterFormValues);
      }
    });
    fetchPayrolls(filterForm.getValues()); // Initial fetch
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterForm.watch]); // React to watch changes

  const handleGeneratePayroll = async (data: PayrollGenerationFormValues) => {
    try {
      const payload: PayrollGenerationRequest = {
        month: data.month,
        year: data.year,
        standardWorkingDays: data.standardWorkingDaysInput ?? undefined,
      };
      const res = await fetch("/api/hr/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.details || result.error || t("errorGeneratingPayroll"));
      }
      toast({ title: t("payrollGeneratedSuccessTitle"), description: result.message });
      setGenerationSummary(result.message);
      fetchPayrolls(filterForm.getValues()); // Refresh list for the current/filtered view
    } catch (err: any) {
      toast({ variant: "destructive", title: t("errorGeneratingPayrollTitle"), description: err.message });
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return common("na");
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount); // TODO: Use dynamic currency
  };

  const clearFilters = () => {
    filterForm.reset({ filterMonth: undefined, filterYear: undefined, filterEmployeeId: "" });
    // fetchPayrolls({}); // This will be triggered by the watch effect
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">{t("payrollProcessingTitle") || "Payroll Processing"}</h2>

      {/* Payroll Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generatePayrollTitle") || "Generate Payroll"}</CardTitle>
          <CardDescription>{t("generatePayrollDesc") || "Generate payroll records for a specific month and year."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generationForm.handleSubmit(handleGeneratePayroll)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="month" className="block text-sm font-medium mb-1">{t("monthField")}</label>
              <Controller
                name="month"
                control={generationForm.control}
                render={({ field }) => (
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                    <SelectTrigger><SelectValue placeholder={t("selectMonthPlaceholder")} /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {generationForm.formState.errors.month && <p className="text-sm text-destructive mt-1">{generationForm.formState.errors.month.message}</p>}
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-1">{t("yearField")}</label>
              <Controller name="year" control={generationForm.control} render={({ field }) => <Input id="year" type="number" {...field} />} />
              {generationForm.formState.errors.year && <p className="text-sm text-destructive mt-1">{generationForm.formState.errors.year.message}</p>}
            </div>
            <div>
              <label htmlFor="standardWorkingDaysInput" className="block text-sm font-medium mb-1">{t("standardWorkingDaysField")} ({common("optional")})</label>
              <Controller name="standardWorkingDaysInput" control={generationForm.control} render={({ field }) => <Input id="standardWorkingDaysInput" type="number" {...field} value={field.value ?? ""} placeholder={t("e.g.") + " 22"} />} />
              {generationForm.formState.errors.standardWorkingDaysInput && <p className="text-sm text-destructive mt-1">{generationForm.formState.errors.standardWorkingDaysInput.message}</p>}
            </div>
            <Button type="submit" disabled={generationForm.formState.isSubmitting} className="md:self-end">
              <FileCog className="mr-2 h-4 w-4" />
              {generationForm.formState.isSubmitting ? common("loading") : t("generateButton")}
            </Button>
          </form>
          {generationSummary && <p className="mt-4 text-sm text-green-600 dark:text-green-400">{generationSummary}</p>}
        </CardContent>
      </Card>

      {/* Payroll List Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("payrollRecordsTitle") || "Payroll Records"}</CardTitle>
          <CardDescription>{t("payrollRecordsDesc") || "View and manage generated payroll records."}</CardDescription>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-4">
            {/* Filters */}
            <Controller name="filterMonth" control={filterForm.control} render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} value={String(field.value ?? "")}>
                    <SelectTrigger><SelectValue placeholder={t("filterByMonth")} /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent>
                </Select>
            )} />
            <Controller name="filterYear" control={filterForm.control} render={({ field }) => <Input type="number" placeholder={t("filterByYear")} {...field} value={field.value ?? ""} />} />
            <Controller name="filterEmployeeId" control={filterForm.control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <SelectTrigger><SelectValue placeholder={t("filterByEmployeeAll")} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">{t("allEmployees")}</SelectItem>
                        {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )} />
             <Button onClick={clearFilters} variant="ghost" className="md:self-end">
                <FilterX className="mr-2 h-4 w-4 text-muted-foreground"/> {t("clearFilters")}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPayrolls && <p className="text-center py-4">{common("loading")}</p>}
          {!loadingPayrolls && payrolls.length === 0 && <p className="text-center py-4">{t("noPayrollRecordsFound")}</p>}
          {!loadingPayrolls && payrolls.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("employeeName")}</TableHead>
                  <TableHead>{t("employeeId")}</TableHead>
                  <TableHead>{t("periodField")}</TableHead>
                  <TableHead className="text-right">{t("baseSalaryField")}</TableHead>
                  <TableHead className="text-right">{t("bonusesField")}</TableHead>
                  <TableHead className="text-right">{t("deductionsField")}</TableHead>
                  <TableHead className="text-right">{t("netSalaryField")}</TableHead>
                  <TableHead>{t("paidStatusField")}</TableHead>
                  <TableHead className="text-center">{common("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>{payroll.employee?.name || common("na")}</TableCell>
                    <TableCell>{payroll.employee?.employeeId || common("na")}</TableCell>
                    <TableCell>{payroll.month}/{payroll.year}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.bonusesOrOvertime.reduce((sum, b) => sum + b.amount, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.deductions.reduce((sum, d) => sum + d.amount, 0))}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(payroll.netSalary)}</TableCell>
                    <TableCell>{payroll.paid ? common("paid") : common("unpaid")}</TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/hr/payroll/${payroll.id}`}>
                          {common("viewDetails")} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
