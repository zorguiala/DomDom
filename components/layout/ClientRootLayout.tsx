"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AbilityProvider } from "@/components/providers/ability-provider";
import { useSession } from "next-auth/react";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/language-context";
import { usePathname } from "next/navigation";

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <Providers>
        <SessionContent>{children}</SessionContent>
        <Toaster />
      </Providers>
    </LanguageProvider>
  );
}

// Helper component to access session after SessionProvider is available
import { ReactNode } from "react";
function SessionContent({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  // @ts-ignore: Extend session type to include role in production
  const role = session?.user?.role || "guest";
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <AbilityProvider role={role}>
      {isAuthRoute ? (
        children
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      )}
    </AbilityProvider>
  );
}
