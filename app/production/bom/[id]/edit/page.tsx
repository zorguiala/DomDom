"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Table, TableHead, TableRow, TableCell, TableBody } from "@magicuidesign/mcp";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function BOMEditPage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const bomId = params?.id as string;

  const [bom, setBOM] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/production/bom?id=${bomId}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(setBOM)
      .catch(e => setError(e.toString()))
      .finally(() => setLoading(false));
  }, [bomId]);

  const handleChange = (field: string, value: any) => {
    setBOM((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/production/bom", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bom),
      });
      router.push("/production/bom");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>{common("loading")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!bom) return <div>{t("bomNotFound")}</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("editBOM")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label>{t("bomName")}</label>
              <Input value={bom.name} onChange={e => handleChange("name", e.target.value)} />
            </div>
            <div>
              <label>{t("bomDescription")}</label>
              <Textarea value={bom.description} onChange={e => handleChange("description", e.target.value)} />
            </div>
            <div>
              <label>{t("bomFinalProduct")}</label>
              <Input value={bom.finalProductId} onChange={e => handleChange("finalProductId", e.target.value)} />
            </div>
            <div>
              <label>{t("components")}</label>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("componentName")}</TableCell>
                    <TableCell>{t("quantity")}</TableCell>
                    <TableCell>{t("unit")}</TableCell>
                    <TableCell>{common("actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bom.components.map((comp: any) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.product}</TableCell>
                      <TableCell>{comp.quantity}</TableCell>
                      <TableCell>{comp.unit}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">{common("edit")}</Button>
                        <Button size="sm" variant="destructive">{common("delete")}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button className="mt-2">{t("addComponent")}</Button>
            </div>
            <Button type="submit" className="mt-4">{common("save")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 