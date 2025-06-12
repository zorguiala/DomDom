// components/layout/language-switcher.tsx
"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface DisplayLocale {
  code: "en" | "fr";
  name: string;
  flag: string;
}

const displayLocales: DisplayLocale[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const currentDisplayLocale =
    displayLocales.find((l) => l.code === language) || displayLocales[0];

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
            onClick={() => setLanguage(loc.code as "en" | "fr")}
            className={language === loc.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{loc.flag}</span>
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
