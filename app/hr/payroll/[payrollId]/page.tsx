"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // For 'Paid' status
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PayrollData, PayrollAdjustmentItem, UpdatePayrollRequest } from "@/types/hr";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle, Trash2, Printer, Edit, Save } from "lucide-react";

const payrollAdjustmentItemSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
});

const updatePayrollFormSchema = z.object({
  baseSalary: z.number().positive().optional(),
  bonusesOrOvertime: z.array(payrollAdjustmentItemSchema).optional(),
  deductions: z.array(payrollAdjustmentItemSchema).optional(),
  paid: z.boolean().optional(),
  paidAt: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type UpdatePayrollFormValues = z.infer<typeof updatePayrollFormSchema>;

export default function PayrollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const payrollId = params?.payrollId as string;

  const t = useTranslations("hr");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // To toggle edit mode

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<UpdatePayrollFormValues>({
    resolver: zodResolver(updatePayrollFormSchema),
    defaultValues: {
      baseSalary: undefined, // Will be populated from fetched data
      bonusesOrOvertime: [],
      deductions: [],
      paid: false,
      paidAt: null,
      notes: "",
    },
  });

  const { fields: bonusFields, append: appendBonus, remove: removeBonus } = useFieldArray({ control, name: "bonusesOrOvertime" });
  const { fields: deductionFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({ control, name: "deductions" });

  const watchedBonuses = watch("bonusesOrOvertime");
  const watchedDeductions = watch("deductions");
  const watchedBaseSalary = watch("baseSalary");

  const calculatedNetSalary = useMemo(() => {
    const base = Number(watchedBaseSalary || payrollData?.baseSalary || 0);
    const totalBonuses = (watchedBonuses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalDeductions = (watchedDeductions || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return base + totalBonuses - totalDeductions;
  }, [watchedBonuses, watchedDeductions, watchedBaseSalary, payrollData?.baseSalary]);


  useEffect(() => {
    let isMounted = true;
    
    if (payrollId) {
      setIsLoading(true);
      
      const fetchPayrollData = async () => {
        try {
          const res = await fetch(`/api/hr/payroll/${payrollId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch payroll details");
          }
          
          const data: PayrollData = await res.json();
          
          if (isMounted) {
            setPayrollData(data);
            reset({
              baseSalary: data.baseSalary, // Or originalBaseSalary if that's what should be editable
              bonusesOrOvertime: data.bonusesOrOvertime || [],
              deductions: data.deductions || [],
              paid: data.paid,
              paidAt: data.paidAt ? new Date(data.paidAt) : null,
              notes: data.notes ?? "",
            });
            setIsLoading(false);
          }
        } catch (err: any) {
          if (isMounted) {
            toast({ variant: "destructive", title: "Error", description: err.message });
            router.push("/hr/payroll"); // Redirect if error
            setIsLoading(false);
          }
        }
      };

      fetchPayrollData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [payrollId]); // Only depend on payrollId

  const onSubmit = async (data: UpdatePayrollFormValues) => {
    try {
      const payload: UpdatePayrollRequest = {
        ...data,
        baseSalary: data.baseSalary ? Number(data.baseSalary) : undefined, // Send if changed
        bonusesOrOvertime: data.bonusesOrOvertime?.map(item => ({...item, amount: Number(item.amount)})),
        deductions: data.deductions?.map(item => ({...item, amount: Number(item.amount)})),
        paidAt: data.paidAt ? data.paidAt.toISOString() : null,
        netSalary: calculatedNetSalary, // Send the recalculated net salary
      };

      const res = await fetch(`/api/hr/payroll/${payrollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details?.map((d: any) => d.message).join(', ') || errorData.error || t("errorUpdatingPayroll"));
      }
      const updatedData: PayrollData = await res.json();
      setPayrollData(updatedData); // Update local state with response
      reset({ // Re-sync form with potentially server-modified data (like recalculated netSalary)
        baseSalary: updatedData.baseSalary,
        bonusesOrOvertime: updatedData.bonusesOrOvertime || [],
        deductions: updatedData.deductions || [],
        paid: updatedData.paid,
        paidAt: updatedData.paidAt ? new Date(updatedData.paidAt) : null,
        notes: updatedData.notes ?? "",
      });
      toast({ title: t("payrollUpdatedSuccessTitle"), description: t("payrollUpdatedSuccessDesc") });
      setIsEditing(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: common("error"), description: err.message });
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("payslip-printable-area");
    if (printContent) {
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      newWindow?.document.write(`<html><head><title>${t('payslipTitle')}</title>`);
      // TODO: Add styles here if needed, or link to a stylesheet
      newWindow?.document.write('<style>body {font-family: sans-serif;} table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid #ddd; padding: 8px; text-align: left;} .payslip-header {text-align: center; margin-bottom: 20px;} .payslip-section {margin-bottom: 15px;} .payslip-summary {margin-top:20px; font-weight:bold;}</style>');
      newWindow?.document.write('</head><body>');
      newWindow?.document.write(printContent.innerHTML);
      newWindow?.document.write('</body></html>');
      newWindow?.document.close();
      newWindow?.print();
    }
  };


  if (isLoading) return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  if (!payrollData) return <div className="text-center py-10">{t("payrollRecordNotFound")}</div>;

  const currentBaseSalary = watchedBaseSalary ?? payrollData.baseSalary;


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("payrollDetailsTitle") || "Payroll Details"}</h2>
          <p className="text-muted-foreground">
            {t("payrollPeriodLabel") || "Period"}: {payrollData.month}/{payrollData.year} | {t("employeeName")}: {payrollData.employee?.name} ({payrollData.employee?.employeeId})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/hr/payroll")}>{common("backToList")}</Button>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            <Edit className="mr-2 h-4 w-4" /> {isEditing ? common("cancel") : common("edit")}
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> {t("printPayslipButton") || "Print Payslip"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        // EDITING FORM
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("editPayrollRecordTitle") || "Edit Payroll Record"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Base Salary (if editable) */}
              <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium mb-1">{t("baseSalaryField")}</label>
                <Controller name="baseSalary" control={control} render={({ field }) => <Input id="baseSalary" type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
                {errors.baseSalary && <p className="text-sm text-destructive mt-1">{errors.baseSalary.message}</p>}
              </div>

              {/* Bonuses/Overtime */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t("bonusesOrOvertimeField") || "Bonuses / Overtime"}</CardTitle>
                    <Button type="button" size="sm" variant="outline" onClick={() => appendBonus({ reason: "", amount: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t("addBonusButton") || "Add Bonus"}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {bonusFields.map((field, index) => (
                        <div key={field.id} className="flex items-end space-x-2">
                            <div className="flex-grow">
                                <label className="text-xs">{t("reasonField")}</label>
                                <Controller name={`bonusesOrOvertime.${index}.reason`} control={control} render={({ field }) => <Input {...field} />} />
                                {errors.bonusesOrOvertime?.[index]?.reason && <p className="text-sm text-destructive">{errors.bonusesOrOvertime[index]?.reason?.message}</p>}
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs">{t("amountField")}</label>
                                <Controller name={`bonusesOrOvertime.${index}.amount`} control={control} render={({ field }) => <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
                                {errors.bonusesOrOvertime?.[index]?.amount && <p className="text-sm text-destructive">{errors.bonusesOrOvertime[index]?.amount?.message}</p>}
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeBonus(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t("deductionsField") || "Deductions"}</CardTitle>
                    <Button type="button" size="sm" variant="outline" onClick={() => appendDeduction({ reason: "", amount: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t("addDeductionButton") || "Add Deduction"}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {deductionFields.map((field, index) => (
                        <div key={field.id} className="flex items-end space-x-2">
                            <div className="flex-grow">
                                <label className="text-xs">{t("reasonField")}</label>
                                <Controller name={`deductions.${index}.reason`} control={control} render={({ field }) => <Input {...field} />} />
                                {errors.deductions?.[index]?.reason && <p className="text-sm text-destructive">{errors.deductions[index]?.reason?.message}</p>}
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs">{t("amountField")}</label>
                                <Controller name={`deductions.${index}.amount`} control={control} render={({ field }) => <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
                                {errors.deductions?.[index]?.amount && <p className="text-sm text-destructive">{errors.deductions[index]?.amount?.message}</p>}
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeDeduction(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </CardContent>
              </Card>

              {/* Calculated Net Salary (Display Only in Edit Mode) */}
              <div className="text-right">
                <p className="text-lg font-semibold">{t("netSalaryField") || "Net Salary"}: {formatCurrency(calculatedNetSalary)}</p>
              </div>

              {/* Paid Status & Date */}
              <div className="flex items-center space-x-4">
                <Controller
                  name="paid"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="paid" checked={field.value} onChange={field.onChange} />
                      <label htmlFor="paid" className="text-sm font-medium">{t("markAsPaidField") || "Mark as Paid"}</label>
                    </div>
                  )}
                />
                {watch("paid") && (
                  <div>
                    <label htmlFor="paidAt" className="block text-sm font-medium mb-1">{t("paidDateField")}</label>
                    <Controller name="paidAt" control={control} render={({ field }) => <DatePicker date={field.value || undefined} setDate={field.onChange} placeholder={t("selectPaidDatePlaceholder")} />} />
                    {errors.paidAt && <p className="text-sm text-destructive mt-1">{errors.paidAt.message}</p>}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">{t("notesField")}</label>
                <Controller name="notes" control={control} render={({ field }) => <Textarea id="notes" {...field} value={field.value ?? ""} />} />
                {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); /* Reset to original fetched data */ }}>{common("cancel")}</Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />{isSubmitting ? common("saving") : common("saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        // DISPLAY MODE & PRINTABLE PAYSLIP AREA
        <Card id="payslip-printable-area">
          <CardHeader>
            <CardTitle className="text-xl text-center">{t("payslipTitle") || "Payslip"}</CardTitle>
            <CardDescription className="text-center">
              {t("payslipForPeriod") || "For the period"}: {payrollData.month}/{payrollData.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="payslip-section"> {/* Employee Details */}
              <h3 className="font-semibold text-md mb-1">{t("employeeInformationTitle") || "Employee Information"}</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <p><strong>{t("employeeNameField")}:</strong> {payrollData.employee?.name}</p>
                <p><strong>{t("employeeIdField")}:</strong> {payrollData.employee?.employeeId}</p>
                {/* Add more employee details if needed, e.g., department, position */}
              </div>
            </div>
            <hr/>
            <div className="payslip-section grid grid-cols-2 gap-4"> {/* Earnings & Deductions */}
              <div>
                <h3 className="font-semibold text-md mb-1">{t("earningsTitle") || "Earnings"}</h3>
                <table className="w-full text-sm"><tbody>
                  <tr><td>{t("baseSalaryField") || "Base Salary"}:</td><td className="text-right">{formatCurrency(currentBaseSalary)}</td></tr>
                  {(payrollData.bonusesOrOvertime || []).map((item, idx) => (
                    <tr key={`bonus-${idx}`}><td>{item.reason}:</td><td className="text-right">{formatCurrency(item.amount)}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div>
                <h3 className="font-semibold text-md mb-1">{t("deductionsField") || "Deductions"}</h3>
                <table className="w-full text-sm"><tbody>
                  {(payrollData.deductions || []).map((item, idx) => (
                    <tr key={`deduction-${idx}`}><td>{item.reason}:</td><td className="text-right">{formatCurrency(item.amount)}</td></tr>
                  ))}
                </tbody></table>
              </div>
            </div>
            <hr/>
            <div className="payslip-summary grid grid-cols-2 gap-1 text-sm pt-2"> {/* Summary */}
                <p><strong>{t("totalEarningsField") || "Total Earnings"}:</strong></p>
                <p className="text-right">{formatCurrency(currentBaseSalary + (payrollData.bonusesOrOvertime || []).reduce((s, i) => s + i.amount, 0))}</p>
                <p><strong>{t("totalDeductionsField") || "Total Deductions"}:</strong></p>
                <p className="text-right">{formatCurrency((payrollData.deductions || []).reduce((s, i) => s + i.amount, 0))}</p>
                <p className="text-lg font-bold">{t("netSalaryField") || "Net Salary"}:</p>
                <p className="text-lg font-bold text-right">{formatCurrency(payrollData.netSalary)}</p>
            </div>
             <hr/>
            <div className="text-sm mt-2">
                <strong>{t("paidStatusField")}:</strong> {payrollData.paid ? common("paid") : common("unpaid")}
                {payrollData.paid && payrollData.paidAt && (
                    <span> ({t("paidOnField") || "Paid on"}: {new Date(payrollData.paidAt).toLocaleDateString()})</span>
                )}
            </div>
            {payrollData.notes && <div className="mt-2 text-sm"><strong>{t("notesField")}:</strong> {payrollData.notes}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
