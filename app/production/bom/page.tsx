"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatTND } from "@/lib/currency";
import { Package, Factory } from "lucide-react";

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
      const data = await res.json();
      setBOMs(data.boms || []); // Extract boms array from response
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
              <TableRow>
                <TableHead>{t("bomName")}</TableHead>
                <TableHead>{t("finalProduct")}</TableHead>
                <TableHead>{t("outputQuantity")}</TableHead>
                <TableHead>{t("unitCost")}</TableHead>
                <TableHead>{t("components")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead>{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{bom.name}</p>
                        {bom.description && (
                          <p className="text-xs text-muted-foreground">{bom.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">{bom.finalProduct?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{bom.finalProduct?.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bom.outputQuantity} {bom.outputUnit}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {bom.unitCost ? formatTND(bom.unitCost) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {bom.components?.length || 0} {t("components")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(bom.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/production/bom/${bom.id}/edit`}>
                        <Button size="sm" variant="outline">{common("edit")}</Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(bom.id)}
                      >
                        {common("delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {boms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("noBOMs")}
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