"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BOMCreatePage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const router = useRouter();
  const [bom, setBOM] = useState({
    name: "",
    description: "",
    finalProductId: "",
    components: [],
  });
  const [component, setComponent] = useState({ productId: "", quantity: 1, unit: "pcs" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComponent = () => {
    setBOM({
      ...bom,
      components: [...bom.components, { ...component, id: Date.now().toString() }],
    });
    setComponent({ productId: "", quantity: 1, unit: "pcs" });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/production/bom", {
        method: "POST",
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("createBOM")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label>{t("bomName")}</label>
              <Input value={bom.name} onChange={e => setBOM({ ...bom, name: e.target.value })} />
            </div>
            <div>
              <label>{t("bomDescription")}</label>
              <Textarea value={bom.description} onChange={e => setBOM({ ...bom, description: e.target.value })} />
            </div>
            <div>
              <label>{t("bomFinalProduct")}</label>
              <Input value={bom.finalProductId} onChange={e => setBOM({ ...bom, finalProductId: e.target.value })} />
            </div>
            <div>
              <label>{t("components")}</label>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("componentName")}</TableCell>
                    <TableCell>{t("quantity")}</TableCell>
                    <TableCell>{t("unit")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bom.components.map((comp: any) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.productId}</TableCell>
                      <TableCell>{comp.quantity}</TableCell>
                      <TableCell>{comp.unit}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Input value={component.productId} onChange={e => setComponent({ ...component, productId: e.target.value })} placeholder={t("componentName")} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={component.quantity} onChange={e => setComponent({ ...component, quantity: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <Input value={component.unit} onChange={e => setComponent({ ...component, unit: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Button type="button" onClick={addComponent}>{t("addComponent")}</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" className="mt-4" disabled={loading}>
              {loading ? common("loading") : common("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 