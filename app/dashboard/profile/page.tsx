// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ShieldCheck } from "lucide-react";
import { UpdateNameForm } from "@/components/profile/UpdateNameForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useAbility } from "@/components/providers/ability-provider";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const ability = useAbility();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [currentName, setCurrentName] = useState(""); // To pass to UpdateNameForm
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setCurrentName(session.user.name || "");
      setEmail(session.user.email || "");
      // Fallback: try to get role from session.user or from localStorage/session
      // @ts-ignore
      setRole(
        (session.user.role as string) ||
          localStorage.getItem("userRole") ||
          "user",
      );
      setIsSessionLoading(false);
    } else if (status === "loading") {
      setIsSessionLoading(true);
    } else {
      setIsSessionLoading(false);
    }
  }, [session, status]);

  const handleNameUpdated = async (newName: string) => {
    // This function is called by UpdateNameForm to update the session
    // Ensure session object and user object exist before spreading
    if (session && session.user) {
      await updateSession({
        ...session,
        user: { ...session.user, name: newName },
      });
    } else {
      // Fallback or refetch if session is not as expected
      await updateSession();
    }
    setCurrentName(newName);
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Access Denied. Please sign in.</p>
      </div>
    );
  }

  // Example: Only allow updating name if user has permission
  const canUpdateProfile = ability.can("update", "Profile");

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            View and manage your profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Details Section (Read-only part) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-9 bg-muted/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="role"
                type="text"
                value={role}
                disabled
                className="pl-9 bg-muted/40"
              />
            </div>
          </div>

          {/* Update Name Form */}
          {canUpdateProfile && (
            <UpdateNameForm
              currentName={currentName}
              onNameUpdate={handleNameUpdated}
            />
          )}
        </CardContent>

        <Separator className="my-6" />

        {/* Change Password Section */}
        <CardHeader className="pt-0">
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
