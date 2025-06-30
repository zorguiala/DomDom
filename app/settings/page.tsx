"use client";

import { useTranslations } from "@/lib/language-context";
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
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Shield,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const common = useTranslations("common");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>{t("profile.title")}</CardTitle>
            </div>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{common("name")}</Label>
              <Input id="name" placeholder={t("profile.namePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{common("email")}</Label>
              <Input id="email" type="email" placeholder={t("profile.emailPlaceholder")} />
            </div>
            <Button>{common("save")}</Button>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <CardTitle>{t("language.title")}</CardTitle>
            </div>
            <CardDescription>{t("language.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("language.instruction")}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t("security.title")}</CardTitle>
            </div>
            <CardDescription>{t("security.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("security.newPassword")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("security.newPasswordPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("security.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("security.confirmPasswordPlaceholder")}
              />
            </div>
            <Button>{t("security.updatePasswordButton")}</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t("notifications.title")}</CardTitle>
            </div>
            <CardDescription>{t("notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("notifications.comingSoon")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
