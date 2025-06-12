// "use-client";
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { LanguageProvider } from "@/lib/language-context"; // Importing LanguageProvider
import ClientRootLayout from "@/components/layout/ClientRootLayout";

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Only use server-safe providers here */}
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
