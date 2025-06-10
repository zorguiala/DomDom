// components/layout/sidebar.tsx
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
  Users, // Keep for default icon if session is not available
  CreditCard,
  Settings,
  Menu,
  X,
  List,
  ClipboardList,
  Briefcase,
  CalendarCheck,
  DollarSign,
  LogOut, // Import LogOut icon
  UserCircle2, // Import a user icon for profile
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut
import { Button } from "@/components/ui/button"; // Import Button for Sign Out

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations("common");
  const { data: session, status } = useSession(); // Get session data and status

  const navigationItems: NavigationItem[] = [
    // ... (navigation items remain the same)
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
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/sign-in" }); // Redirect to sign-in page after sign out
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background sticky top-0", // Added h-screen and sticky top-0
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-200",
        className,
      )}
    >
      {/* Logo/Header */}
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
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {" "}
        {/* Added overflow-y-auto */}
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
      </nav>

      {/* User section & Actions */}
      <div className="mt-auto border-t p-4 space-y-2">
        {" "}
        {/* Added mt-auto to push to bottom */}
        <div
          className={cn(
            "flex",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <LanguageSwitcher />
        </div>
        {status === "authenticated" && session?.user && (
          <div
            className={cn(
              "flex items-center mb-2", // Added mb-2 for spacing
              isCollapsed ? "justify-center flex-col space-y-1" : "space-x-3",
            )}
          >
            <Link href="/dashboard/profile" title="View Profile">
              <UserCircle2
                className={cn(
                  "h-8 w-8 text-muted-foreground hover:text-primary",
                  isCollapsed && "h-6 w-6",
                )}
              />
            </Link>
            {!isCollapsed && (
              <div className="flex-1">
                <p
                  className="text-sm font-medium truncate"
                  title={session.user.name || "User"}
                >
                  <Link href="/dashboard/profile" className="hover:underline">
                    {session.user.name || "User"}
                  </Link>
                </p>
                <p
                  className="text-xs text-muted-foreground truncate"
                  title={session.user.email || ""}
                >
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}
        {status === "authenticated" ? (
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full flex items-center justify-start",
              isCollapsed && "justify-center",
            )}
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        ) : status === "loading" ? (
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "",
            )}
          >
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            {!isCollapsed && (
              <div className="ml-2 h-4 w-20 bg-muted rounded animate-pulse"></div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full flex items-center justify-start",
              isCollapsed && "justify-center",
            )}
            asChild
          >
            <Link href="/auth/sign-in" title="Sign In">
              <LogOut
                className={cn(
                  "h-4 w-4 transform rotate-180",
                  !isCollapsed && "mr-2",
                )}
              />{" "}
              {/* Icon for Sign In */}
              {!isCollapsed && <span>Sign In</span>}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
