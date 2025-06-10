// app/[locale]/dashboard/purchases/suppliers/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For App Router
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface SupplierFormData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  mf: string;
}

export default function NewSupplierPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const router = useRouter();
  const t = useTranslations("suppliers"); // Adjust as needed
  const commonT = useTranslations("common");
  const { toast } = useToast();

  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    mf: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = t("companyNameRequired") || "Company name is required.";
    }
    // Add other validations if needed, e.g., email format
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email || null, // Send null if empty for optional fields
          phone: formData.phone || null,
          address: formData.address || null,
          mf: formData.mf || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorCreate") || "Failed to create supplier");
      }

      toast({
        title: t("success") || "Success",
        description: t("supplierCreated") || "Supplier created successfully.",
      });
      router.push(`/${locale}/dashboard/purchases/suppliers`);
    } catch (err: any) {
      toast({
        title: commonT("error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("newSupplierTitle") || "Create New Supplier"}</h2>
        <Link href={`/${locale}/dashboard/purchases/suppliers`} passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList") || "Back to Supplier List"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("supplierDetails") || "Supplier Details"}</CardTitle>
          <CardDescription>{t("fillFormNewSupplier") || "Fill in the form below to add a new supplier."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="companyName">{t("companyName") || "Company Name"} <span className="text-red-500">*</span></Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <Label htmlFor="email">{t("email") || "Email"}</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="phone">{t("phone") || "Phone"}</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="address">{t("address") || "Address"}</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="mf">{t("mf") || "Matricule Fiscal (MF)"}</Label>
              <Input id="mf" name="mf" value={formData.mf} onChange={handleChange} />
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard/purchases/suppliers`)} disabled={isLoading}>
                    {commonT("cancel") || "Cancel"}
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (commonT("saving") || "Saving...") : (commonT("save") || "Save Supplier")}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
