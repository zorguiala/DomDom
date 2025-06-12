// app/[locale]/dashboard/sales/clients/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface ClientFormData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  mf: string;
}

interface Client extends ClientFormData {
  id: string;
}

export default function EditClientPage({ params: routeParams }: { params: { locale: string; id: string } }) {
  const locale = routeParams.locale;
  const clientId = routeParams.id;
  const router = useRouter();

  const t = useTranslations("clients");
  const commonT = useTranslations("common");
  const { toast } = useToast();

  const [formData, setFormData] = useState<ClientFormData>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    mf: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    setIsFetching(true);
    async function fetchClientDetails() {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (response.status === 404) {
          setNotFound(true);
          toast({ title: commonT("error") || "Error", description: t("clientNotFound") || "Client not found.", variant: "destructive" });
          return;
        }
        if (!response.ok) {
          throw new Error(t("errorFetchDetails") || "Failed to fetch client details");
        }
        const data = await response.json();
        const client: Client = data.client; // Assuming API returns { client: Client }
        setFormData({
          companyName: client.companyName || "",
          email: client.email || "",
          phone: client.phone || "",
          address: client.address || "",
          mf: client.mf || "",
        });
      } catch (err: any) {
        toast({ title: commonT("error") || "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    }
    fetchClientDetails();
  }, [clientId, toast, t, commonT]);

  const validate = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = t("companyNameRequired") || "Company name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || notFound) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          mf: formData.mf || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorUpdate") || "Failed to update client");
      }

      toast({
        title: t("success") || "Success",
        description: t("clientUpdated") || "Client updated successfully.",
      });
      router.push(`/${locale}/dashboard/sales/clients`);
    } catch (err: any) {
      toast({ title: commonT("error") || "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("loading") || "Loading client details..."}</p></div>;
  }

  if (notFound) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card>
          <CardHeader><CardTitle>{t("clientNotFoundTitle") || "Client Not Found"}</CardTitle></CardHeader>
          <CardContent>
            <p>{t("clientNotFoundMessage") || "The client you are trying to edit does not exist."}</p>
            <Link href={`/${locale}/dashboard/sales/clients`} passHref className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList") || "Back to Client List"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("editClientTitle") || "Edit Client"}</h2>
        <Link href={`/${locale}/dashboard/sales/clients`} passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList") || "Back to Client List"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("clientDetails") || "Client Details"}</CardTitle>
          <CardDescription>{t("fillFormEditClient") || "Update the form below to edit the client."}</CardDescription>
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
                <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard/sales/clients`)} disabled={isLoading}>
                    {commonT("cancel") || "Cancel"}
                </Button>
                <Button type="submit" disabled={isLoading || isFetching}>
                    {isLoading ? (commonT("saving") || "Saving...") : (commonT("saveChanges") || "Save Changes")}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
