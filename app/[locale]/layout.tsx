import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClientRootLayout from "@/components/layout/ClientRootLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimpleERP - Lightweight ERP System",
  description:
    "Modern, lightweight ERP system for small manufacturing & distribution companies",
  keywords: ["ERP", "inventory", "production", "sales", "HR", "manufacturing"],
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default function LocaleLayout({ 
  children, 
  params 
}: LocaleLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
