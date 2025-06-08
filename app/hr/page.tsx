"use client";

import { useTranslations } from "@/lib/language-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import Link
import { Plus, Users, Clock, Calendar, UserCheck, Briefcase } from "lucide-react"; // Added Briefcase

export default function HRPage() {
  const t = useTranslations("hr");
  const common = useTranslations("common");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/hr/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addEmployee")}
            </Button>
          </Link>
        </div>
      </div>

      {/* HR Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalEmployees")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div> {/* Static data */}
            <p className="text-xs text-muted-foreground">+2 this month</p> {/* Static data */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("presentToday")}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div> {/* Static data */}
            <p className="text-xs text-muted-foreground">91.7% attendance</p> {/* Static data */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("onLeave")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div> {/* Static data */}
            <p className="text-xs text-muted-foreground">Scheduled leave</p> {/* Static data */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overtime")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15h</div> {/* Static data */}
            <p className="text-xs text-muted-foreground">This week</p> {/* Static data */}
          </CardContent>
        </Card>
      </div>

      {/* Links to Modules */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/hr/employees" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {t("manageEmployeesTitle") || "Manage Employees"}
              </CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("manageEmployeesCtaDescription") || "View, add, and edit employee records."}
              </p>
            </CardContent>
          </Link>
        </Card>

        {/* Attendance Link */}
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/hr/attendance" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {t("manageAttendanceTitle") || "Manage Attendance"}
              </CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("manageAttendanceCtaDescription") || "Record and view employee attendance."}
              </p>
            </CardContent>
          </Link>
        </Card>

        {/* Placeholder for Payroll Link */}
        <Card className="hover:shadow-lg transition-shadow opacity-60 cursor-not-allowed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {t("runPayrollTitle") || "Run Payroll"}
              </CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("runPayrollCtaDescription") || "Process salaries and generate payslips. (Coming Soon)"}
              </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
