// app/[locale]/dashboard/sales/commercials/[id]/edit/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface Client { id: string; companyName: string; } // For dropdown
interface CommercialData { // For API response
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  clientId?: string | null;
  client?: Client | null; // Populated if exists
}
interface CommercialFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  clientId: string;
}

export default function EditCommercialPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const [locale, setLocale] = useState<string>("");
  const [commercialId, setCommercialId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    params.then(resolvedParams => {
      setLocale(resolvedParams.locale);
      setCommercialId(resolvedParams.id);
    });
  }, [params]);

  const t = useTranslations("commercials");
  const commonT = useTranslations("common");
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<CommercialFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    clientId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Partial<CommercialFormData>>({});
  const [notFound, setNotFound] = useState(false);

  const populateForm = useCallback((commercial: CommercialData) => {
    setFormData({
      name: commercial.name || "",
      email: commercial.email || "",
      phone: commercial.phone || "",
      address: commercial.address || "",
      clientId: commercial.clientId || "",
    });
  }, []);

  useEffect(() => {
    if (!commercialId || !locale) return;

    setIsFetching(true);
    async function fetchInitialData() {
      try {
        const [commercialRes, clientsRes] = await Promise.all([
          fetch(`/api/commercials/${commercialId}`),
          fetch("/api/clients")
        ]);

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData.clients || []);
        } else {
          throw new Error(t("errorFetchClients") || "Failed to fetch clients for selection");
        }

        if (commercialRes.status === 404) {
          setNotFound(true);
          toast({ title: commonT("error"), description: t("commercialNotFound") || "Commercial contact not found.", variant: "destructive" });
          return;
        }
        if (!commercialRes.ok) {
          throw new Error(t("errorFetchDetails") || "Failed to fetch commercial contact details");
        }
        const data = await commercialRes.json();
        populateForm(data.commercial); // Assuming API returns { commercial: CommercialData }

      } catch (err: any) {
        toast({ title: commonT("error"), description: err.message, variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    }
    fetchInitialData();
  }, [commercialId, toast, t, commonT, populateForm]);

  const validate = (): boolean => {
    const newErrors: Partial<CommercialFormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired") || "Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (clientIdValue: string) => {
    setFormData((prev) => ({ ...prev, clientId: clientIdValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || notFound) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/commercials/${commercialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          clientId: formData.clientId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorUpdate") || "Failed to update commercial contact");
      }

      toast({
        title: t("success") || "Success",
        description: t("commercialUpdated") || "Commercial contact updated successfully.",
      });
      router.push(`/${locale}/dashboard/sales/commercials`);
    } catch (err: any) {
      toast({ title: commonT("error"), description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("loading") || "Loading details..."}</p></div>;
  }

  if (notFound) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card>
          <CardHeader><CardTitle>{t("commercialNotFoundTitle") || "Contact Not Found"}</CardTitle></CardHeader>
          <CardContent>
            <p>{t("commercialNotFoundMessage") || "The commercial contact does not exist."}</p>
            <Link href={`/${locale}/dashboard/sales/commercials`} passHref className="mt-4 inline-block">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("editCommercialTitle") || "Edit Commercial Contact"}</h2>
        <Link href={`/${locale}/dashboard/sales/commercials`} passHref>
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("commercialDetails") || "Commercial Contact Details"}</CardTitle>
          <CardDescription>{t("fillFormEditCommercial") || "Update the form to edit the contact."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">{t("name") || "Name"} <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className={errors.name ? "border-red-500" : ""}/>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
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
              <Label htmlFor="clientId">{t("associatedClient") || "Associated Client (Optional)"}</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger><SelectValue placeholder={t("selectClientPlaceholder") || "Select a client..."} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("noClientAssociated") || "None"}</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard/sales/commercials`)} disabled={isLoading}>
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
