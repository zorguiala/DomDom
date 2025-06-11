// components/layout/UserSection.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";
import { LogOut, UserCircle2 } from "lucide-react";

interface UserSectionProps {
  isCollapsed: boolean;
}

export function UserSection({ isCollapsed }: UserSectionProps) {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/sign-in" });
  };

  return (
    <div className="mt-auto border-t p-4 space-y-2">
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
            "flex items-center mb-2",
            isCollapsed ? "justify-center flex-col space-y-1" : "space-x-3",
          )}
        >
          <Link href="/dashboard/profile" title="View Profile">
            <UserCircle2 className={cn("h-8 w-8 text-muted-foreground hover:text-primary", isCollapsed && "h-6 w-6")} />
          </Link>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={session.user.name || "User"}>
                <Link href="/dashboard/profile" className="hover:underline">
                  {session.user.name || "User"}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground truncate" title={session.user.email || ""}>
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
          className={cn("w-full flex items-center", isCollapsed ? "justify-center" : "justify-start")}
          onClick={handleSignOut}
          title="Sign Out"
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      ) : status === "loading" ? (
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          {!isCollapsed && <div className="ml-2 h-4 w-20 bg-muted rounded animate-pulse"></div>}
        </div>
      ) : (
        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          className={cn("w-full flex items-center", isCollapsed ? "justify-center" : "justify-start")}
          asChild
        >
          <Link href="/auth/sign-in" title="Sign In">
            <LogOut className={cn("h-4 w-4 transform rotate-180", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span>Sign In</span>}
          </Link>
        </Button>
      )}
    </div>
  );
}
