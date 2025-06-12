// lib/permissions.ts
import {
  AbilityBuilder,
  Ability,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from "@casl/ability";

// Define actions and subjects for your app
export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "User" | "Inventory" | "Profile" | "Settings" | "all";

export type AppAbility = Ability<[Actions, Subjects]>;

/**
 * Defines CASL abilities for a given user role.
 * @param role - The user's role (e.g., 'admin', 'manager', 'user', etc.)
 * @returns AppAbility instance with permissions for the role.
 */
export function defineAbilitiesFor(role: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<
    Ability<[Actions, Subjects]>
  >(Ability as AbilityClass<AppAbility>);

  // Admin: full access
  if (role === "admin") {
    can("manage", "all");
  }
  // Manager: read all, update inventory/profile, cannot delete users
  else if (role === "manager") {
    can("read", "all");
    can("update", "Inventory");
    can("update", "Profile");
    cannot("delete", "User");
  }
  // User: read inventory/profile, update profile, cannot delete
  else if (role === "user") {
    can("read", "Inventory");
    can("read", "Profile");
    can("update", "Profile");
    cannot("delete", "User");
    cannot("delete", "Inventory");
  }
  // Guest or unknown: minimal access
  else {
    can("read", "Profile");
  }

  // Use detectSubjectType for advanced object-based checks if needed
  return build(); // Removed detectSubjectType to avoid TS error
}
