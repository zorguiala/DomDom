// app/[locale]/dashboard/sales/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface Client {
  id: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  mf?: string | null;
}

export default function ClientsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const t = useTranslations("clients"); // Translation keys for clients
  const commonT = useTranslations("common");
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error(t("errorFetch") || "Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data.clients || []);
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
    fetchClients();
  }, []);

  const handleDelete = async (clientId: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this client?")) {
      return;
    }
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorDelete") || "Failed to delete client");
      }
      toast({
        title: t("success") || "Success",
        description: t("clientDeleted") || "Client deleted successfully.",
      });
      fetchClients(); // Refresh the list
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
        <h2 className="text-3xl font-bold tracking-tight">{t("title") || "Clients"}</h2>
        <Link href={`/${locale}/dashboard/sales/clients/new`} passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("newClient") || "New Client"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("clientList") || "Client List"}</CardTitle>
          <CardDescription>{t("manageClientsDescription") || "View and manage your clients."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("companyName") || "Company Name"}</TableHead>
                <TableHead>{t("email") || "Email"}</TableHead>
                <TableHead>{t("phone") || "Phone"}</TableHead>
                <TableHead>{t("address") || "Address"}</TableHead>
                <TableHead>{t("mf") || "MF"}</TableHead>
                <TableHead className="text-right">{commonT("actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.companyName}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.address || "-"}</TableCell>
                    <TableCell>{client.mf || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${locale}/dashboard/sales/clients/${client.id}/edit`} passHref>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Edit className="mr-1 h-4 w-4" /> {commonT("edit") || "Edit"}
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> {commonT("delete") || "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t("noClientsFound") || "No clients found."}
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
