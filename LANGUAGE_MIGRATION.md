# Language Switching System Migration

## Overview

This document describes the migration from URL-based locale routing (using Next.js internationalization with `[locale]` routes) to client-side language switching using React context and localStorage.

## Migration Summary

### What Was Changed

1. **Removed URL-based locale routing**:

   - Deleted `app/[locale]/` directory structure
   - Removed `middleware.ts` locale routing logic
   - Removed `next-intl` dependency and configuration
   - Updated `next.config.js` to remove internationalization settings

2. **Implemented client-side language context**:

   - Created `lib/language-context.tsx` with React context for language management
   - Added localStorage persistence for user language preferences
   - Implemented browser language detection fallback
   - Created comprehensive translation messages object

3. **Updated all page components**:

   - Migrated all pages to use `useTranslations` hook from language context
   - Added `'use client'` directive to pages that need client-side features
   - Updated language switcher components to use new context

4. **Enhanced UI components**:
   - Integrated language switcher into sidebar
   - Updated all text to use translation keys
   - Maintained consistent naming conventions for compatibility

## Language Context Features

### Core Functionality

- **Language Support**: English (en) and French (fr)
- **Persistence**: User language preference saved in localStorage
- **Browser Detection**: Falls back to browser language if no preference saved
- **Backward Compatibility**: Maintains both `language/setLanguage` and `locale/setLocale` naming

### Translation System

- **Static Messages**: All translations defined in a static object for better performance
- **Namespace Support**: Organized translations by module (dashboard, sales, inventory, etc.)
- **Fallback**: Returns the key if translation is not found
- **Type Safety**: Full TypeScript support for translation keys

## Usage

### In Components

```tsx
"use client";

import { useTranslations } from "@/lib/language-context";

export default function MyComponent() {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{common("export")}</button>
    </div>
  );
}
```

### Language Switching

```tsx
import { useLanguage } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button onClick={() => setLanguage(language === "en" ? "fr" : "en")}>
      {language === "en" ? "Français" : "English"}
    </button>
  );
}
```

## Translation Namespaces

The system includes comprehensive translations for all modules:

- **common**: Shared terms (export, loading, filter, etc.)
- **dashboard**: Dashboard-specific terms
- **sales**: Sales management terms
- **inventory**: Inventory management terms
- **production**: Production management terms
- **purchases**: Purchase management terms
- **hr**: Human resources terms
- **expenses**: Expense management terms
- **settings**: Settings and configuration terms

## File Structure

```
lib/
  language-context.tsx          # Main language context and translations
components/
  layout/
    language-switcher.tsx       # Language switcher component
    sidebar.tsx                 # Sidebar with integrated language switcher
app/
  layout.tsx                    # Root layout with LanguageProvider
  dashboard/page.tsx            # Dashboard using language context
  sales/page.tsx               # Sales page using language context
  inventory/page.tsx           # Inventory page using language context
  [other modules]/page.tsx     # All other pages using language context
```

## Migration Benefits

1. **Performance**: No server-side route resolution needed
2. **Simplicity**: Easier to manage and maintain
3. **User Experience**: Instant language switching without page reload
4. **SEO**: Can be enhanced with proper meta tags and hreflang
5. **Flexibility**: Easy to add new languages
6. **Type Safety**: Full TypeScript support

## Adding New Languages

To add a new language:

1. Add the locale to the `Locale` type in `language-context.tsx`
2. Add the messages object for the new language
3. Update language switcher to include the new option
4. Test all components with the new language

## Adding New Translation Keys

1. Add the key to both English and French messages objects
2. Use the key in your component with the appropriate namespace
3. Ensure TypeScript compilation passes

## Testing

The language switching system has been tested to ensure:

- ✅ Language preference persists across sessions
- ✅ Browser language detection works properly
- ✅ All pages display correctly in both languages
- ✅ Language switching is instant and doesn't require page reload
- ✅ TypeScript compilation succeeds without errors
- ✅ All UI components render properly with translated text

## Next Steps

1. Consider adding more languages if needed
2. Implement RTL (Right-to-Left) support for Arabic/Hebrew
3. Add translation management tools for non-technical users
4. Consider implementing lazy loading for translation messages
5. Add SEO optimizations with language-specific meta tags
