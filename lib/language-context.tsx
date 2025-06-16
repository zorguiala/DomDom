"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

export type Locale = "en" | "fr";

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  locale: Locale; // Keep for backward compatibility
  setLocale: (locale: Locale) => void; // Keep for backward compatibility
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Load messages from JSON files
const messages = {
  en: enMessages,
  fr: frMessages,
};

// Helper function to get nested value from object
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const result = path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
  
  return typeof result === 'string' ? result : undefined;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("preferred-language") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "fr")) {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLocale = navigator.language.startsWith("fr") ? "fr" : "en";
      setLocaleState(browserLocale);
    }
    setIsInitialized(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("preferred-language", newLocale);
  };

  const t = (key: string) => {
    const value = getNestedValue(messages[locale], key);
    return value || key; // Return the key if translation is not found
  };

  // Don't render until we've loaded the saved preference
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  const contextValue: LanguageContextType = {
    language: locale,
    setLanguage: setLocale,
    locale,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook for easy access to translations
export function useTranslations(namespace?: string) {
  const { t } = useLanguage();

  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey);
  };
}
