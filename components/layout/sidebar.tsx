// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import { NavigationItem } from "@/types";
import { Factory, Menu, X } from "lucide-react"; // Kept only used icons here
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getNavigationItems } from "@/lib/navigation"; // Import the new function
import { UserSection } from "@/components/layout/UserSection"; // Import UserSection

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations("common");
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string })?.role;

  const allNavigationItems = useMemo(() => getNavigationItems(t), [t]);

  const filteredNavigationItems = useMemo(() => {
    if (status !== "authenticated" || !userRole) {
      return [];
    }

    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => {
          if (!item.roles || item.roles.length === 0) {
            return true;
          }
          return item.roles.includes(userRole);
        })
        .map((item) => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterItems(item.children);
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
            // Keep parent if it's a direct link even if children are filtered out
            if (
              item.href &&
              (!item.children ||
                item.children.length === 0 ||
                filteredChildren.length === 0)
            ) {
              return { ...item, children: [] };
            }
            return null; // Parent has no href and all children filtered out OR (no href and no children initially)
          }
          return item;
        })
        .filter((item) => item !== null) as NavigationItem[];
    };

    return filterItems(allNavigationItems);
  }, [userRole, status, allNavigationItems]);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background sticky top-0",
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-200",
        className,
      )}
    >
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

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {filteredNavigationItems.map((item) => {
          const isActive = item.href && pathname.startsWith(item.href);
          const Icon = item.icon; // Icon component is part of NavigationItem type

          // Skip rendering if item has no href and no visible children
          if (!item.href && (!item.children || item.children.length === 0)) {
            return null;
          }

          return (
            <div key={item.title}>
              <Link
                href={item.href || "#"}
                onClick={(e) => {
                  if (!item.href && item.children && item.children.length > 0)
                    e.preventDefault();
                }}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-2",
                  !item.href &&
                    item.children &&
                    item.children.length > 0 &&
                    "cursor-default",
                )}
              >
                {Icon && (
                  <Icon className={cn("h-4 w-4", isCollapsed && "mx-auto")} />
                )}
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
              {!isCollapsed && item.children && item.children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon; // Icon component for child
                    const isChildActive =
                      child.href && pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.title}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isChildActive
                            ? "text-foreground"
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

      <UserSection isCollapsed={isCollapsed} />
    </div>
  );
}
