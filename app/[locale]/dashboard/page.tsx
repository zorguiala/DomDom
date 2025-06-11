import { Suspense } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DashboardKPIs } from "@/components/dashboard/dashboard-kpis";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { InventoryOverview } from "@/components/dashboard/inventory-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProductionStatus } from "@/components/dashboard/production-status";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <div className="flex items-center space-x-2">
          <ShimmerButton>{common("export")} {t("reportButtonSuffix")}</ShimmerButton>
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<div>{t("loadingKpis")}</div>}>
        <DashboardKPIs />
      </Suspense>

      {/* Charts and Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {" "}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("revenueChart")}</CardTitle>
            <CardDescription>
              {t("revenueChartDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div>{common("loading")}</div>}>
              <RevenueChart />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>{t("recentActivityDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>{common("loading")}</div>}>
              <RecentActivity />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Additional Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle>{t("inventoryOverview")}</CardTitle>
            <CardDescription>
              {t("inventoryOverviewDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>{common("loading")}</div>}>
              <InventoryOverview />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("productionStatus")}</CardTitle>
            <CardDescription>
              {t("productionStatusDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>{common("loading")}</div>}>
              <ProductionStatus />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
