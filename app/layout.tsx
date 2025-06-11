// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/toaster";
// Sidebar is removed from here

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
        <LanguageProvider> {/* LanguageProvider should likely be inside SessionProvider if it uses session data, or SessionProvider inside Providers */}
          <Providers> {/* Assuming SessionProvider is within Providers component */}
            {children} {/* Sidebar is no longer here, main content will be pages or nested layouts */}
            <Toaster /> {/* Global Toaster */}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
