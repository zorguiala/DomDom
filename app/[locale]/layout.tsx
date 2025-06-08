import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import { locales } from "@/lib/i18n";
import Providers from "@/components/providers/providers";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex h-screen">
              <Sidebar
                locale={locale}
                translations={{
                  dashboard: t("dashboard"),
                  inventory: t("inventory"),
                  production: t("production"),
                  purchases: t("purchases"),
                  sales: t("sales"),
                  hr: t("hr"),
                  expenses: t("expenses"),
                  settings: t("settings"),
                }}
              />
              <main className="flex-1 overflow-y-auto bg-gray-50/50">
                {children}
              </main>
            </div>
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
