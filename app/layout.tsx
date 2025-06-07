import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/providers";
import { LanguageProvider } from "@/lib/language-context";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimpleERP - Lightweight ERP System",
  description:
    "Modern, lightweight ERP system for small manufacturing & distribution companies",
  keywords: ["ERP", "inventory", "production", "sales", "HR", "manufacturing"],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout component that wraps the entire application
 * Provides global styles, fonts, and context providers
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider>
          <Providers>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
