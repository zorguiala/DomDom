// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, // Import CardFooter
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, User as UserIcon, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react"; // Import Lock, Eye, EyeOff
import { Separator } from "@/components/ui/separator"; // Import Separator

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setRole(session.user.role || "");
      setIsSessionLoading(false);
    } else if (status === 'loading') {
      setIsSessionLoading(true);
    } else {
      setIsSessionLoading(false); // Not loading and no session
    }
  }, [session, status]);

  const handleNameUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (name === session?.user?.name) return;
    setIsUpdatingName(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast({ variant: "destructive", title: "Error", description: result.message || "Failed to update name." });
      } else {
        toast({ title: "Success", description: "Name updated successfully." });
        await updateSession({ ...session, user: { ...session?.user, name } });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) { // Basic validation
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST", // Using POST for password changes
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        setPasswordError(result.message || "Failed to change password.");
        toast({ variant: "destructive", title: "Password Change Error", description: result.message || "Failed to change password." });
      } else {
        toast({ title: "Success", description: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setPasswordError("An unexpected error occurred.");
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isSessionLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading profile...</p></div>;
  }
  if (!session) {
    // This should ideally be handled by middleware redirecting to sign-in
    return <div className="flex items-center justify-center min-h-screen"><p>Access Denied. Please sign in.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>View and manage your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Details Section */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} disabled className="pl-9 bg-muted/40" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="role" type="text" value={role} disabled className="pl-9 bg-muted/40" />
            </div>
          </div>
          <form onSubmit={handleNameUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="pl-9" placeholder="Enter your full name" />
              </div>
            </div>
            <Button type="submit" disabled={isUpdatingName || name === session.user.name} className="w-full sm:w-auto">
              {isUpdatingName ? "Saving..." : "Save Name Changes"}
            </Button>
          </form>
        </CardContent>

        <Separator className="my-6" />

        {/* Change Password Section */}
        <CardHeader className="pt-0"> {/* pt-0 to reduce space after separator */}
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {passwordError && <p className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">{passwordError}</p>}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pl-9 pr-10" placeholder="Enter your current password" />
                <button
                  type="button"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pl-9 pr-10" placeholder="Enter new password" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-9 pr-10" placeholder="Confirm new password"/>
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto">
              {isChangingPassword ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
