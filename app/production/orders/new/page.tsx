"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductionOrderCreatePage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const router = useRouter();
  const [order, setOrder] = useState({
    orderNumber: "",
    productId: "",
    bomId: "",
    qtyOrdered: 1,
    status: "PLANNED",
    priority: "MEDIUM",
    startDate: "",
    expectedEndDate: "",
    notes: "",
  });
  const [products, setProducts] = useState<any[]>([]);
  const [boms, setBOMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
    fetch("/api/production/bom").then(res => res.json()).then(setBOMs);
  }, []);

  const handleChange = (field: string, value: any) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/production/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      router.push("/production/orders");
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
          <CardTitle>{t("createOrder")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label>{t("orderNumber")}</label>
              <Input value={order.orderNumber} onChange={e => handleChange("orderNumber", e.target.value)} />
            </div>
            <div>
              <label>{t("product")}</label>
              <Select value={order.productId} onChange={e => handleChange("productId", e.target.value)}>
                <option value="">{t("selectProduct")}</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label>{t("bom")}</label>
              <Select value={order.bomId} onChange={e => handleChange("bomId", e.target.value)}>
                <option value="">{t("selectBOM")}</option>
                {boms.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label>{t("qtyOrdered")}</label>
              <Input type="number" value={order.qtyOrdered} onChange={e => handleChange("qtyOrdered", Number(e.target.value))} />
            </div>
            <div>
              <label>{t("status")}</label>
              <Select value={order.status} onChange={e => handleChange("status", e.target.value)}>
                <option value="PLANNED">{t("planned")}</option>
                <option value="IN_PROGRESS">{t("inProgress")}</option>
                <option value="COMPLETED">{t("completed")}</option>
                <option value="CANCELLED">{t("cancelled")}</option>
              </Select>
            </div>
            <div>
              <label>{t("priority")}</label>
              <Select value={order.priority} onChange={e => handleChange("priority", e.target.value)}>
                <option value="HIGH">{t("high")}</option>
                <option value="MEDIUM">{t("medium")}</option>
                <option value="LOW">{t("low")}</option>
              </Select>
            </div>
            <div>
              <label>{t("startDate")}</label>
              <Input type="date" value={order.startDate} onChange={e => handleChange("startDate", e.target.value)} />
            </div>
            <div>
              <label>{t("expectedEndDate")}</label>
              <Input type="date" value={order.expectedEndDate} onChange={e => handleChange("expectedEndDate", e.target.value)} />
            </div>
            <div>
              <label>{t("notes")}</label>
              <Textarea value={order.notes} onChange={e => handleChange("notes", e.target.value)} />
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