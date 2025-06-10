// app/[locale]/dashboard/purchases/suppliers/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast"; // Assuming a toast hook exists
import { useTranslations } from "@/lib/language-context"; // Assuming a translation hook

interface Supplier {
  id: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  mf?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SuppliersPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const t = useTranslations("suppliers"); // Adjust translation key as needed
  const commonT = useTranslations("common");
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) {
        throw new Error(t("errorFetch") || "Failed to fetch suppliers");
      }
      const data = await response.json();
      setSuppliers(data.suppliers || []);
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
    fetchSuppliers();
  }, []);

  const handleDelete = async (supplierId: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this supplier?")) {
      return;
    }
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorDelete") || "Failed to delete supplier");
      }
      toast({
        title: t("success") || "Success",
        description: t("supplierDeleted") || "Supplier deleted successfully.",
      });
      fetchSuppliers(); // Refresh the list
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
        <h2 className="text-3xl font-bold tracking-tight">{t("title") || "Suppliers"}</h2>
        <Link href={`/${locale}/dashboard/purchases/suppliers/new`} passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("newSupplier") || "New Supplier"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("supplierList") || "Supplier List"}</CardTitle>
          <CardDescription>{t("manageSuppliersDescription") || "View and manage your suppliers."}</CardDescription>
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
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.companyName}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.address || "-"}</TableCell>
                    <TableCell>{supplier.mf || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${locale}/dashboard/purchases/suppliers/${supplier.id}/edit`} passHref>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Edit className="mr-1 h-4 w-4" /> {commonT("edit") || "Edit"}
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> {commonT("delete") || "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t("noSuppliersFound") || "No suppliers found."}
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
