// app/[locale]/dashboard/sales/commercials/new/page.tsx
"use client";

import { useEffect, useState } from "react";
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

interface Client { // For dropdown
  id: string;
  companyName: string;
}

interface CommercialFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  clientId: string; // Store ID of selected client, empty if none
}

export default function NewCommercialPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>("");

  useEffect(() => {
    params.then(resolvedParams => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);
  const router = useRouter();
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
  const [errors, setErrors] = useState<Partial<CommercialFormData>>({});

  useEffect(() => {
    async function fetchClientsForSelect() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) throw new Error(t("errorFetchClients") || "Failed to fetch clients for selection");
        const data = await response.json();
        setClients(data.clients || []);
      } catch (err: any) {
        toast({ title: commonT("error"), description: err.message, variant: "destructive" });
      }
    }
    fetchClientsForSelect();
  }, [toast, t, commonT]);

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
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/commercials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          clientId: formData.clientId || null, // Send null if no client selected
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorCreate") || "Failed to create commercial contact");
      }

      toast({
        title: t("success") || "Success",
        description: t("commercialCreated") || "Commercial contact created successfully.",
      });
      router.push(`/${locale}/dashboard/sales/commercials`);
    } catch (err: any) {
      toast({ title: commonT("error"), description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("newCommercialTitle") || "Create New Commercial Contact"}</h2>
        <Link href={`/${locale}/dashboard/sales/commercials`} passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToList") || "Back to List"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("commercialDetails") || "Commercial Contact Details"}</CardTitle>
          <CardDescription>{t("fillFormNewCommercial") || "Fill in the form to add a new commercial contact."}</CardDescription>
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
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (commonT("saving") || "Saving...") : (commonT("save") || "Save Contact")}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
