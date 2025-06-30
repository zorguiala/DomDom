"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { signIn } from "next-auth/react"; // Import signIn
import { useTranslations } from "@/lib/language-context"; // Import useTranslations
import { useToast } from "@/hooks/use-toast"; // Import useToast
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Building2, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations("auth"); // Use "auth" namespace for translations
  const commonT = useTranslations("common"); // For common terms like "loading"
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null); // For displaying general error messages

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    if (!formData.email || !formData.password) {
      setError(
        t("emailAndPasswordRequired") || "Email and password are required.",
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false, // Handle redirect manually
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? t("signInFailed") || "Sign in failed. Check your credentials."
            : result.error; // Use specific error from NextAuth if not CredentialsSignin
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: t("signInErrorTitle") || "Sign In Error",
          description: errorMessage,
        });
      } else if (result?.ok) {
        toast({
          title: t("signInSuccessTitle") || "Sign In Successful",
          description: t("signInSuccessDesc") || "Welcome back!",
        });
        router.push("/dashboard"); // Redirect to dashboard on successful sign-in
      } else {
        // Handle cases where result is ok but no specific error (should not happen often with redirect:false)
        setError(
          t("signInErrorUnexpected") ||
            "An unexpected error occurred during sign in.",
        );
      }
    } catch (err) {
      console.error("Sign in exception:", err);
      setError(
        t("signInErrorUnexpected") ||
          "An unexpected error occurred during sign in.",
      );
      toast({
        variant: "destructive",
        title: t("signInErrorTitle") || "Sign In Error",
        description:
          t("signInErrorUnexpected") || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {t("signInToErp") || "Sign in to SimpleERP"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("accessYourDashboard") ||
              "Access your ERP dashboard and manage your business"}
          </p>
        </div>

        {/* Sign In Form */}
        <Card className="dark:bg-slate-850">
          <CardHeader>
            <CardTitle>{t("welcomeBack") || "Welcome back"}</CardTitle>
            <CardDescription>
              {t("enterCredentials") ||
                "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <p className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("emailAddress") || "Email address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t("emailPlaceholder") || "john@example.com"}
                    className="pl-9"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password") || "Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder={
                      t("passwordPlaceholder") || "Enter your password"
                    }
                    className="pl-9 pr-9"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-slate-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("rememberMe") || "Remember me"}
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password" // This route might need to be created/handled
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {t("forgotPassword") || "Forgot password?"}
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? commonT("loading") || "Signing in..."
                  : t("signInButton") || "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-850 px-2 text-gray-500 dark:text-gray-400">
                    {t("orContinueWith") || "Or continue with"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" disabled>
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  > 
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />{" "}
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />{" "}
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />{" "}
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("dontHaveAccount") || "Don't have an account?"}{" "}
            <Link
              href="/auth/sign-up" // This route might need to be created/handled
              className="font-medium text-primary hover:text-primary/80"
            >
              {t("signUpFree") || "Sign up for free"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
