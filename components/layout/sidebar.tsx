"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "@/lib/language-context";
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
  Menu,
  X,
  List,
  ClipboardList,
  Briefcase,
  CalendarCheck, // Icon for Attendance
  DollarSign, // Icon for Payroll
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

/**
 * Main sidebar navigation component
 * Displays navigation links for all ERP modules
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations("common");
  const navigationItems: NavigationItem[] = [
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
      children: [
        {
          title: t("manageEmployees") || "Manage Employees", // Added translation key
          href: "/hr/employees",
          icon: Briefcase,
        },
        {
          title: t("attendance") || "Attendance", // Added translation key
          href: "/hr/attendance",
          icon: CalendarCheck,
        },
        {
          title: t("payroll") || "Payroll", // Added translation key
          href: "/hr/payroll",
          icon: DollarSign, // Using DollarSign icon for Payroll
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
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-200",
        className,
      )}
    >
      {/* Logo/Header */}{" "}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Factory className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">SimpleERP</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-8 w-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
              {/* Render children if present */}
              {!isCollapsed && item.children && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isChildActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {ChildIcon && <ChildIcon className="h-4 w-4" />}
                        <span className="ml-3">{child.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>{" "}
      {/* User section */}
      <div className="border-t p-4 space-y-4">
        {/* Language switcher */}
        <div
          className={cn(
            "flex",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <LanguageSwitcher />
        </div>

        {/* User info */}
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3",
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Users className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@company.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
