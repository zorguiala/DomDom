"use client";
// components/providers/ability-provider.tsx
import React, { createContext, useContext, useMemo } from "react";
import { defineAbilitiesFor, AppAbility } from "@/lib/permissions";

interface AbilityProviderProps {
  role: string;
  children: React.ReactNode;
}

const AbilityContext = createContext<AppAbility | null>(null);

export const AbilityProvider = ({ role, children }: AbilityProviderProps) => {
  const ability = useMemo(() => defineAbilitiesFor(role), [role]);
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability)
    throw new Error("useAbility must be used within AbilityProvider");
  return ability;
}
