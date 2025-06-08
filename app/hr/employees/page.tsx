"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "@prisma/client"; // Assuming prisma generate has run

export default function EmployeesListPage() {
  const router = useRouter();
  const t = useTranslations("hr");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hr/employees");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to fetch employees: ${res.statusText}`,
        );
      }
      setEmployees(await res.json());
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: t("errorFetchingEmployeesTitle") || "Error Fetching Employees",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (employeeId: string) => {
    if (
      !confirm(
        t("confirmDeleteEmployee") ||
          "Are you sure you want to delete this employee?",
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/hr/employees/${employeeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to delete employee",
        );
      }
      toast({
        title: t("employeeDeletedTitle") || "Employee Deleted",
        description:
          t("employeeDeletedDesc") ||
          "The employee has been successfully deleted.",
      });
      fetchEmployees(); // Refresh list
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("errorDeletingEmployeeTitle") || "Delete Failed",
        description: err.message,
      });
    }
  };

  const getStatusBadgeVariant = (isActive?: boolean) => {
    return isActive ? "success" : "secondary";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        {common("loading")}
      </div>
    );
  if (error && employees.length === 0)
    return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("manageEmployeesTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("manageEmployeesDescription")}
          </p>
        </div>
        <Link href="/hr/employees/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("addEmployee")}
          </Button>
        </Link>
      </div>

      {error && employees.length > 0 && (
        <p className="text-sm font-medium text-destructive text-center py-2">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("employeeName")}</TableHead>
                <TableHead>{t("employeeId")}</TableHead>
                <TableHead>{t("position")}</TableHead>
                <TableHead>{t("department")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-center">
                  {common("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("noEmployeesFound")}
                  </TableCell>
                </TableRow>
              )}
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.position || common("na")}</TableCell>
                  <TableCell>{employee.department || common("na")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(employee.isActive)}>
                      {employee.isActive
                        ? common("active")
                        : common("inactive")}
                    </Badge>
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
                        <DropdownMenuLabel>
                          {common("actions")}
                        </DropdownMenuLabel>
                        {/* <DropdownMenuItem onClick={() => router.push(`/hr/employees/${employee.id}`)}>
                          {common("viewDetails")}
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/hr/employees/${employee.id}/edit`)
                          }
                        >
                          {common("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700 dark:focus:text-red-50"
                        >
                          {common("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
