// components/layout/language-switcher.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { Locale } from "@/lib/i18n"; // Assuming Locale is exported from i18n

// Define type for displayLocales if not already present
interface DisplayLocale {
    code: Locale;
    name: string;
    flag: string;
}

const displayLocales: DisplayLocale[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("common"); // For potential ARIA labels or tooltips if needed

  const handleLanguageChange = (newLocale: Locale) => {
    // Replace the /en or /fr part of the path with the new locale
    // This assumes pathnames are always prefixed with locale, e.g., /en/dashboard
    const newPathname = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    router.push(newPathname);
    // router.refresh(); // Might be needed if server components depend on locale
  };

  const currentDisplayLocale = displayLocales.find((l) => l.code === currentLocale) || displayLocales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">
            {currentDisplayLocale.flag} {currentDisplayLocale.name}
          </span>
          <span className="sm:hidden">{currentDisplayLocale.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {displayLocales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLanguageChange(loc.code)}
            className={currentLocale === loc.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{loc.flag}</span>
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
