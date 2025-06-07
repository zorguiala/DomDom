"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BOMListPage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const [boms, setBOMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBOMs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/production/bom");
      if (!res.ok) throw new Error(await res.text());
      setBOMs(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteBOM") || "Delete BOM?")) return;
    await fetch("/api/production/bom", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBOMs();
  };

  if (loading) return <div>{common("loading")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("bomListTitle")}</CardTitle>
          </div>
          <Link href="/production/bom/new">
            <Button>{t("newBOM")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
            
                <TableHead>{t("bomId")}</TableHead>
                <TableHead>{t("bomName")}</TableHead>
                <TableHead>{t("bomDescription")}</TableHead>
                <TableHead>{t("bomFinalProduct")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead>{t("updatedAt")}</TableHead>
                <TableHead>{common("actions")}</TableHead>
          
            </TableHeader>
            <TableBody>
              {boms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell>{bom.id}</TableCell>
                  <TableCell>{bom.name}</TableCell>
                  <TableCell>{bom.description}</TableCell>
                  <TableCell>{bom.finalProductId}</TableCell>
                  <TableCell>{new Date(bom.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(bom.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/production/bom/${bom.id}/edit`}>
                      <Button size="sm" variant="outline">{common("edit")}</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(bom.id)}>{common("delete")}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 