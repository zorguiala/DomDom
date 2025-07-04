// app/[locale]/dashboard/sales/commercials/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface ClientInfo { // For nested client data
  id: string;
  companyName: string;
}
interface Commercial {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  clientId?: string | null; // Foreign key
  client?: ClientInfo | null; // Populated by Prisma include
}

export default function CommercialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>("");

  useEffect(() => {
    params.then(resolvedParams => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);
  const t = useTranslations("commercials");
  const commonT = useTranslations("common");
  const { toast } = useToast();
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCommercials() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/commercials"); // API includes client data
      if (!response.ok) {
        throw new Error(t("errorFetch") || "Failed to fetch commercial contacts");
      }
      const data = await response.json();
      setCommercials(data.commercials || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: commonT("error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCommercials();
  }, []);

  const handleDelete = async (commercialId: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this commercial contact?")) {
      return;
    }
    try {
      const response = await fetch(`/api/commercials/${commercialId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorDelete") || "Failed to delete commercial contact");
      }
      toast({
        title: t("success") || "Success",
        description: t("commercialDeleted") || "Commercial contact deleted successfully.",
      });
      fetchCommercials(); // Refresh
    } catch (err: any) {
      toast({
        title: commonT("error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("loading") || "Loading..."}</p></div>;
  }
  if (error) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("error") || "Error"}: {error}</p></div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("title") || "Commercial Contacts"}</h2>
        <Link href={`/${locale}/dashboard/sales/commercials/new`} passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("newCommercial") || "New Commercial Contact"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("commercialList") || "Commercial Contact List"}</CardTitle>
          <CardDescription>{t("manageCommercialsDescription") || "View and manage your commercial contacts."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name") || "Name"}</TableHead>
                <TableHead>{t("email") || "Email"}</TableHead>
                <TableHead>{t("phone") || "Phone"}</TableHead>
                <TableHead>{t("address") || "Address"}</TableHead>
                <TableHead>{t("associatedClient") || "Associated Client"}</TableHead>
                <TableHead className="text-right">{commonT("actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commercials.length > 0 ? (
                commercials.map((commercial) => (
                  <TableRow key={commercial.id}>
                    <TableCell>{commercial.name}</TableCell>
                    <TableCell>{commercial.email || "-"}</TableCell>
                    <TableCell>{commercial.phone || "-"}</TableCell>
                    <TableCell>{commercial.address || "-"}</TableCell>
                    <TableCell>{commercial.client?.companyName || t("none") || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${locale}/dashboard/sales/commercials/${commercial.id}/edit`} passHref>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Edit className="mr-1 h-4 w-4" /> {commonT("edit") || "Edit"}
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(commercial.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> {commonT("delete") || "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t("noCommercialsFound") || "No commercial contacts found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
