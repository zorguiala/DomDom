// app/auth/reset-password/[token]/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string | undefined;
  const { toast } = useToast();
  const t = useTranslations("auth"); // Assuming translations for this page are in 'auth'
  const commonT = useTranslations("common");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // null: checking, true: valid, false: invalid

  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.invalidToken') || "Invalid or missing reset token.");
      setIsValidToken(false);
      return;
    }
    // Optionally, you could pre-validate the token here by making a GET request
    // For simplicity, we'll let the POST request handle validation
    setIsValidToken(true);
  }, [token, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newPassword || !confirmPassword) {
      setError(t('resetPassword.allFieldsRequired') || "All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordsDoNotMatch') || "Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError(t('resetPassword.passwordTooShort') || "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('resetPassword.resetFailed') || "Failed to reset password. The link may be invalid or expired.");
        toast({
          variant: "destructive",
          title: t('resetPassword.errorTitle') || "Error",
          description: data.message || t('resetPassword.resetFailed') || "Failed to reset password.",
        });
      } else {
        setSuccessMessage(data.message || t('resetPassword.successMessage') || "Password has been reset successfully. You can now sign in.");
        toast({
          title: t('resetPassword.successTitle') || "Success",
          description: data.message || t('resetPassword.successMessage') || "Password has been reset successfully.",
        });
        setNewPassword("");
        setConfirmPassword("");
        // Optionally redirect after a delay
        setTimeout(() => router.push("/auth/sign-in"), 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(t('resetPassword.unexpectedError') || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: t('resetPassword.errorTitle') || "Error",
        description: t('resetPassword.unexpectedError') || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === false) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>{t('resetPassword.invalidLinkTitle') || "Invalid Link"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error || t('resetPassword.invalidOrExpiredLink') || "This password reset link is invalid or has expired."}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/auth/sign-in" className="text-sm text-primary hover:text-primary/80 flex items-center">
                        <ArrowLeft className="mr-1 h-4 w-4" /> {t('resetPassword.backToSignIn') || "Back to Sign In"}
                    </Link>
                </CardFooter>
            </Card>
        </div>
     );
  }

  if (isValidToken === null) {
    return <div className="flex items-center justify-center min-h-screen"><p>{commonT("loading") || "Loading..."}</p></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('resetPassword.title') || "Reset Your Password"}</CardTitle>
          <CardDescription>
            {t('resetPassword.description') || "Enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="space-y-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 text-center p-2 bg-green-500/10 rounded-md">{successMessage}</p>
                <Button asChild className="w-full">
                    <Link href="/auth/sign-in">{t('resetPassword.proceedToSignIn') || "Proceed to Sign In"}</Link>
                </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('resetPassword.newPasswordLabel') || "New Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder={t('resetPassword.newPasswordPlaceholder') || "Enter new password"}
                    className="pl-9 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('resetPassword.confirmPasswordLabel') || "Confirm New Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder={t('resetPassword.confirmPasswordPlaceholder') || "Confirm new password"}
                    className="pl-9 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (commonT("loading") || "Resetting Password...") : (t('resetPassword.submitButton') || "Reset Password")}
              </Button>
            </form>
          )}
        </CardContent>
        {!successMessage && (
            <CardFooter className="flex justify-center">
                <Link href="/auth/sign-in" className="text-sm text-primary hover:text-primary/80 flex items-center">
                    <ArrowLeft className="mr-1 h-4 w-4" /> {t('resetPassword.backToSignIn') || "Back to Sign In"}
                </Link>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
