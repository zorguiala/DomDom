// lib/navigation.ts
import { NavigationItem } from "@/types";
import {
  BarChart3,
  Package,
  Factory,
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  Settings,
  List,
  ClipboardList,
  Briefcase,
  CalendarCheck,
  DollarSign,
  Building,
} from "lucide-react";

// Define a type for the translation function if not already globally available
type TFunction = (key: string) => string;

export const getNavigationItems = (t: TFunction): NavigationItem[] => [
  {
    title: t("dashboard"),
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: t("inventory"),
    href: "/inventory",
    icon: Package,
  },
  {
    title: t("production"),
    href: "/production",
    icon: Factory,
    children: [
      {
        title: t("bomManagement"),
        href: "/production/bom",
        icon: List,
      },
      {
        title: t("productionOrders"),
        href: "/production/orders",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: t("purchases"),
    href: "/purchases",
    icon: ShoppingCart,
    children: [
      {
        title: t("suppliers") || "Suppliers",
        href: "/suppliers",
        icon: Building,
      },
    ],
  },
  {
    title: t("sales"),
    href: "/sales",
    icon: TrendingUp,
  },
  {
    title: t("hr"),
    href: "/hr",
    icon: Users,
    roles: ["ADMIN", "HR_MANAGER"],
    children: [
      {
        title: t("manageEmployees") || "Manage Employees",
        href: "/hr/employees",
        icon: Briefcase,
      },
      {
        title: t("attendance") || "Attendance",
        href: "/hr/attendance",
        icon: CalendarCheck,
      },
      {
        title: t("payroll") || "Payroll",
        href: "/hr/payroll",
        icon: DollarSign,
      },
    ],
  },
  {
    title: t("expenses"),
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: t("settings"),
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];
