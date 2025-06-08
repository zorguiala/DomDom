"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"; // Not used for now
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeFormData } from "@/types/hr"; // Using the shared type
import { PlusCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker"; // Import DatePicker

// Zod schema for new employee form validation
const newEmployeeFormSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  department: z.string().optional().nullable().or(z.literal('')),
  position: z.string().optional().nullable().or(z.literal('')),
  salary: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.number().positive("Salary must be a positive number").nullable().optional()
  ),
  hireDate: z.date({ required_error: "Hire date is required." }), // Changed to z.date()
  isActive: z.boolean().default(true).optional(),
});


export default function AddEmployeePage() {
  const router = useRouter();
  const t = useTranslations("hr");
  const common = useTranslations("common");
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmployeeFormData>({
    resolver: zodResolver(newEmployeeFormSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: null,
      hireDate: new Date().toISOString().split('T')[0], // Default to today as string for form
      isActive: true,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      // Convert hireDate from Date object (from react-hook-form with DatePicker) to string for API
      const payload = {
        ...data,
        salary: data.salary ? Number(data.salary) : null,
        hireDate: new Date(data.hireDate).toISOString().split('T')[0],
      };
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to create employee");
      }

      toast({
        title: t("employeeCreatedTitle") || "Employee Created",
        description: t("employeeCreatedDesc", { name: data.name }) || `Employee ${data.name} has been successfully created.`,
      });
      router.push("/hr/employees"); // Redirect to employee list
    } catch (err: any) {
      console.error("Create employee error:", err);
      toast({
        variant: "destructive",
        title: t("errorCreatingEmployeeTitle") || "Creation Failed",
        description: err.message,
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("addEmployeeTitle")}</h2>
          <p className="text-muted-foreground">{t("addEmployeeDescription")}</p>
        </div>
         <Link href="/hr/employees">
            <Button variant="outline">{common("backToList")}</Button>
          </Link>
      </div>

      <Card>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium mb-1">{t("employeeIdField")}</label>
                <Controller name="employeeId" control={control} render={({ field }) => <Input id="employeeId" {...field} />} />
                {errors.employeeId && <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">{t("employeeNameField")}</label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">{t("emailField")}</label>
                <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} value={field.value ?? ""} />} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">{t("phoneField")}</label>
                <Controller name="phone" control={control} render={({ field }) => <Input id="phone" {...field} value={field.value ?? ""} />} />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-1">{t("departmentField")}</label>
                <Controller name="department" control={control} render={({ field }) => <Input id="department" {...field} value={field.value ?? ""} />} />
                {errors.department && <p className="text-sm text-destructive mt-1">{errors.department.message}</p>}
              </div>

              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-1">{t("positionField")}</label>
                <Controller name="position" control={control} render={({ field }) => <Input id="position" {...field} value={field.value ?? ""} />} />
                {errors.position && <p className="text-sm text-destructive mt-1">{errors.position.message}</p>}
              </div>

              {/* Salary */}
              <div>
                <label htmlFor="salary" className="block text-sm font-medium mb-1">{t("salaryField")}</label>
                <Controller
                  name="salary"
                  control={control}
                  render={({ field }) => <Input id="salary" type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />}
                />
                {errors.salary && <p className="text-sm text-destructive mt-1">{errors.salary.message}</p>}
              </div>

              {/* Hire Date */}
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium mb-1">{t("hireDateField")}</label>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                      placeholder={common("selectPlaceholder") || "Select a date"}
                    />
                  )}
                />
                {errors.hireDate && <p className="text-sm text-destructive mt-1">{errors.hireDate.message}</p>}
              </div>

              {/* Is Active Status */}
              <div className="md:col-span-2">
                <label htmlFor="isActive" className="block text-sm font-medium mb-1">{t("statusField")}</label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(value === "true")} value={String(field.value)}>
                      <SelectTrigger id="isActive">
                        <SelectValue placeholder={t("selectStatusPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{common("active")}</SelectItem>
                        <SelectItem value="false">{common("inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.isActive && <p className="text-sm text-destructive mt-1">{errors.isActive.message}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/hr/employees">
                <Button type="button" variant="outline" disabled={isSubmitting}>{common("cancel")}</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" /> {isSubmitting ? common("creating") : t("createEmployeeButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
