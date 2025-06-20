"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { ArrowLeft, Save, Building } from "lucide-react";
import Link from "next/link";

interface SupplierFormData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  mf: string; // Matricule Fiscal
}

export default function NewSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("suppliers");
  const common = useTranslations("common");

  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    mf: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange =
    (field: keyof SupplierFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.companyName) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create supplier");
      }

      const result = await response.json();
      toast({
        title: t("supplierCreated"),
        description: t("supplierCreatedDescription"),
      });
      
      // Redirect back to purchase order creation with the new supplier
      router.push(`/purchases/new/${result.supplier.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating supplier:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/purchases/new">
          <Button className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("addNewSupplier")}
          </h2>
          <p className="text-muted-foreground">
            {t("addSupplierDescription")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              {t("supplierInformation")}
            </CardTitle>
            <CardDescription>
              {t("supplierFormDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t("companyName")} *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange("companyName")}
                  placeholder={t("placeholderCompanyName")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder={t("placeholderEmail")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  placeholder={t("placeholderPhone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mf">{t("matriculeFiscal")}</Label>
                <Input
                  id="mf"
                  value={formData.mf}
                  onChange={handleInputChange("mf")}
                  placeholder={t("placeholderMatriculeFiscal")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange("address")}
                placeholder={t("placeholderAddress")}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? common("saving") : common("save")}
                <Save className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/purchases/new">
                <Button type="button" variant="outline">
                  {common("cancel")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 