"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AttendanceFormData, AttendanceStatus, AttendanceStatusValues, AttendanceWithEmployee } from "@/types/hr";
import { Employee } from "@prisma/client";
import { PlusCircle, Edit2, FilterX, Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming a DatePicker component exists

// Zod schema for attendance form validation
const attendanceFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"), // Using string for form handling
  status: z.enum(AttendanceStatusValues, { required_error: "Status is required." }),
  hoursWorked: z.number().min(0).max(24).nullable().optional(),
  notes: z.string().optional().nullable(),
});

// Local form data type that matches the Zod schema
type AttendanceFormDataLocal = z.infer<typeof attendanceFormSchema>;

export default function AttendancePage() {
  const t = useTranslations("hr");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithEmployee[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceWithEmployee | null>(null);

  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);


  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<AttendanceFormDataLocal>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: "",
      date: new Date().toISOString().split('T')[0], // Default to today
      status: "PRESENT",
      hoursWorked: null,
      notes: "",
    },
  });

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/hr/employees");
        if (!res.ok) throw new Error("Failed to fetch employees");
        setEmployees(await res.json());
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      }
    };
    fetchEmployees();
  }, []); // Remove t and toast from dependencies since this should only run once on mount

  // Fetch attendance records
  const fetchAttendanceRecords = async (employeeId?: string, date?: Date) => {
    setLoadingRecords(true);
    try {
      const queryParams = new URLSearchParams();
      if (employeeId) queryParams.append("employeeId", employeeId);
      if (date) queryParams.append("dateFrom", date.toISOString().split('T')[0]);
      if (date) queryParams.append("dateTo", date.toISOString().split('T')[0]); // Filter for specific date

      const res = await fetch(`/api/hr/attendance?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendance records");
      setAttendanceRecords(await res.json());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    // Fetch attendance records whenever filters change
    const loadAttendanceRecords = async () => {
      setLoadingRecords(true);
      try {
        const queryParams = new URLSearchParams();
        if (filterEmployeeId) queryParams.append("employeeId", filterEmployeeId);
        if (filterDate) queryParams.append("dateFrom", filterDate.toISOString().split('T')[0]);
        if (filterDate) queryParams.append("dateTo", filterDate.toISOString().split('T')[0]);

        const res = await fetch(`/api/hr/attendance?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch attendance records");
        setAttendanceRecords(await res.json());
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      } finally {
        setLoadingRecords(false);
      }
    };
    
    loadAttendanceRecords();
  }, [filterEmployeeId, filterDate]); // Only depend on the filter values


  const onSubmit = async (data: AttendanceFormDataLocal) => {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString().split('T')[0], // Ensure date is YYYY-MM-DD string
      hoursWorked: data.hoursWorked ? Number(data.hoursWorked) : null,
    };

    try {
      const url = editingRecord ? `/api/hr/attendance/${editingRecord.id}` : "/api/hr/attendance";
      const method = editingRecord ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details?.fieldErrors?.date?.[0] || errorData.error || (editingRecord ? t("errorUpdatingAttendance") : t("errorCreatingAttendance")));
      }

      toast({
        title: editingRecord ? t("attendanceUpdatedTitle") : t("attendanceRecordedTitle"),
        description: editingRecord ? t("attendanceUpdatedDesc") : t("attendanceRecordedDesc"),
      });
      resetFormAndFilters();
      fetchAttendanceRecords(filterEmployeeId || undefined, filterDate); // Refresh list
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({ variant: "destructive", title: t("error"), description: errorMessage });
    }
  };

  const handleEdit = (record: AttendanceWithEmployee) => {
    setEditingRecord(record);
    reset({
      employeeId: record.employeeId,
      date: new Date(record.date).toISOString().split('T')[0], // Ensure YYYY-MM-DD for form
      status: record.status as AttendanceStatus, // Prisma status should align with AttendanceStatus
      hoursWorked: record.hoursWorked ?? null,
      notes: record.notes ?? "",
    });
  };

  const resetFormAndFilters = () => {
    reset({
      employeeId: filterEmployeeId || "", // Keep filter if applied
      date: filterDate ? filterDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: "PRESENT",
      hoursWorked: null,
      notes: "",
    });
    setEditingRecord(null);
  };

  const clearFilters = () => {
    setFilterEmployeeId("");
    setFilterDate(undefined);
    resetFormAndFilters(); // Also reset form to default or current filter state
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("manageAttendanceTitle")}</h2>
          <p className="text-muted-foreground">{t("manageAttendanceDescription")}</p>
        </div>
      </div>

      {/* Attendance Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{editingRecord ? t("editAttendanceTitle") : t("recordAttendanceTitle")}</CardTitle>
          <CardDescription>{editingRecord ? t("editAttendanceDesc") : t("recordAttendanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              {/* Employee */}
              <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                <label htmlFor="employeeId" className="block text-sm font-medium mb-1">{t("employeeField")}</label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editingRecord}>
                      <SelectTrigger id="employeeId">
                        <SelectValue placeholder={t("selectEmployeePlaceholder") || "Select employee"} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.employeeId && <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">{t("dateField")}</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                     <DatePicker 
                       date={field.value ? new Date(field.value) : undefined} 
                       setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')} 
                       disabled={!!editingRecord} 
                     />
                  )}
                />
                {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">{t("statusField")}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder={t("selectStatusPlaceholder") || "Select status"} />
                      </SelectTrigger>
                      <SelectContent>
                        {AttendanceStatusValues.map(val => <SelectItem key={val} value={val}>{t(val.toLowerCase()) || val}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>

              {/* Hours Worked */}
              <div>
                <label htmlFor="hoursWorked" className="block text-sm font-medium mb-1">{t("hoursWorkedField")}</label>
                <Controller name="hoursWorked" control={control} render={({ field }) => <Input id="hoursWorked" type="number" step="0.1" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />} />
                {errors.hoursWorked && <p className="text-sm text-destructive mt-1">{errors.hoursWorked.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex items-end space-x-2">
                 <Button type="submit" disabled={isSubmitting} className="w-full">
                  {editingRecord
                    ? <><Edit2 className="mr-2 h-4 w-4" /> {isSubmitting ? common("saving") : common("saveChanges")}</>
                    : <><PlusCircle className="mr-2 h-4 w-4" /> {isSubmitting ? common("recording") : t("recordButton")}</>
                  }
                </Button>
                {editingRecord && <Button type="button" variant="outline" onClick={resetFormAndFilters}>{common("cancel")}</Button>}
              </div>
            </div>
            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">{t("notesField")}</label>
                <Controller name="notes" control={control} render={({ field }) => <Input id="notes" {...field} value={field.value ?? ""} placeholder={t("notesPlaceholder") || "Add notes"} />} />
                {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Attendance Records List Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("attendanceRecordsTitle")}</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
             <Select value={filterEmployeeId || "all"} onValueChange={(value) => setFilterEmployeeId(value === "all" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder={t("filterByEmployee") || "Filter by employee"} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("allEmployees") || "All Employees"}</SelectItem>
                    {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <DatePicker date={filterDate} setDate={setFilterDate} placeholder={t("filterByDate") || "Filter by date"} />
            <Button onClick={() => fetchAttendanceRecords(filterEmployeeId || undefined, filterDate)} variant="outline" size="icon" title={common("search")}><Search className="h-4 w-4"/></Button>
            {(filterEmployeeId || filterDate) &&
                <Button onClick={clearFilters} variant="ghost" size="icon" title={t("clearFilters")}>
                    <FilterX className="h-4 w-4 text-muted-foreground"/>
                </Button>
            }
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("employeeName")}</TableHead>
                <TableHead>{t("dateField")}</TableHead>
                <TableHead>{t("statusField")}</TableHead>
                <TableHead>{t("hoursWorkedField")}</TableHead>
                <TableHead>{t("notesField")}</TableHead>
                <TableHead className="text-right">{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRecords && <TableRow><TableCell colSpan={6} className="text-center">{common("loading")}</TableCell></TableRow>}
              {!loadingRecords && attendanceRecords.length === 0 && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">{t("noAttendanceRecordsFound")}</TableCell></TableRow>
              )}
              {!loadingRecords && attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee?.name || record.employeeId}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t(record.status.toLowerCase()) || record.status}</TableCell>
                  <TableCell>{record.hoursWorked ?? common("na")}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.notes ?? common("na")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                      <Edit2 className="h-4 w-4 mr-1" /> {common("edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Note: Assumes a DatePicker component exists at "@/components/ui/date-picker"
// If not, this would need to be created or an Input type="date" used.
// For translations like t(val.toLowerCase()), ensure your translation files have keys like "present", "absent", "half_day".
