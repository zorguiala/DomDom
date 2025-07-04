"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { Building, Save, X } from "lucide-react";
import { useGetSupplier } from "@/app/purchases/data/use-get-supplier/use-get-supplier";
import { useUpdateSupplier } from "@/app/purchases/data/use-update-supplier/use-update-supplier";

interface SupplierFormData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  mf: string;
}

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    mf: "",
  });

  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("suppliers");
  const common = useTranslations("common");

  // Handle async params
  useEffect(() => {
    async function unwrapParams() {
      const { id } = await params;
      setSupplierId(id);
    }
    unwrapParams();
  }, [params]);

  // Use React Query to fetch supplier data
  const { data: supplier, isPending, error } = useGetSupplier(supplierId);
  const updateSupplierMutation = useUpdateSupplier();

  // Update form data when supplier data is loaded
  useEffect(() => {
    if (supplier) {
      setFormData({
        companyName: supplier.companyName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        mf: supplier.mf || "",
      });
    }
  }, [supplier]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: common("error"),
        description: error.message,
        variant: "destructive",
      });
      router.push("/suppliers");
    }
  }, [error, toast, common, router]);

  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast({
        title: common("error"),
        description: t("companyNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!supplierId) return;

    try {
      await updateSupplierMutation.mutateAsync({
        id: supplierId,
        data: {
          companyName: formData.companyName.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          mf: formData.mf.trim() || null,
        },
      });

      toast({
        title: common("success"),
        description: t("supplierUpdatedSuccessfully"),
      });
      
      router.push("/suppliers");
    } catch (error: any) {
      toast({
        title: common("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">{common("loading")}</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{t("supplierNotFound")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t("editSupplier")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("editSupplierDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t("companyName")} *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder={t("enterCompanyName")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("enterEmail")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("enterPhone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mf">{t("matriculeFiscal")}</Label>
                <Input
                  id="mf"
                  value={formData.mf}
                  onChange={(e) => handleInputChange("mf", e.target.value)}
                  placeholder={t("enterMatriculeFiscal")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("enterAddress")}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={updateSupplierMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateSupplierMutation.isPending ? common("updating") : common("update")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/suppliers")}
              >
                <X className="h-4 w-4 mr-2" />
                {common("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 