"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectMagic } from "@/components/ui/select-magic";
import { useToast } from "@/hooks/use-toast";

interface ProductionOrderData {
  id: string;
  orderNumber: string;
  productId: string;
  qtyOrdered: number;
  qtyProduced: number;
  status: string;
  priority?: string;
  notes?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  bom?: {
    id: string;
    name: string;
    outputQuantity: number;
  };
}

export default function ProductionOrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("production");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [orderData, setOrderData] = useState<ProductionOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: "PLANNED",
    qtyProduced: 0,
    priority: "MEDIUM",
    notes: ""
  });

  const orderId = params?.id as string;

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      fetch(`/api/production/orders/${orderId}`)
        .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
        .then((data: ProductionOrderData) => {
          setOrderData(data);
          setFormData({
            status: data.status,
            qtyProduced: data.qtyProduced || 0,
            priority: data.priority || "MEDIUM",
            notes: data.notes || ""
          });
        })
        .catch(err => {
          console.error(err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load production order"
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [orderId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/production/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to update order");
      }

      toast({
        title: "Success",
        description: "Production order updated successfully"
      });
      
      router.push(`/production/orders/${orderId}`);
    } catch (err: any) {
      console.error("Update error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  }

  if (!orderData) {
    return <div className="text-red-500 text-center p-4">Order not found</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("editProductionOrderTitle")} - {orderData.orderNumber}
        </h2>
        <Link href={`/production/orders/${orderId}`}>
          <Button variant="outline">{common("cancel")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetails")}</CardTitle>
          <div className="text-sm text-gray-600">
            <p><strong>Product:</strong> {orderData.product?.name} ({orderData.product?.sku})</p>
            <p><strong>Quantity Ordered:</strong> {orderData.qtyOrdered}</p>
            <p><strong>BOM:</strong> {orderData.bom?.name} (Output: {orderData.bom?.outputQuantity} units)</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t("status")}</label>
                <SelectMagic 
                  value={formData.status} 
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="PLANNED">{t("planned") || "PLANNED"}</option>
                  <option value="IN_PROGRESS">{t("inProgress") || "IN_PROGRESS"}</option>
                  <option value="DONE">{t("done") || "COMPLETED"}</option>
                  <option value="CANCELLED">{t("cancelled") || "CANCELLED"}</option>
                </SelectMagic>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("qtyProduced")}</label>
                <Input
                  type="number"
                  value={formData.qtyProduced}
                  onChange={(e) => setFormData(prev => ({ ...prev, qtyProduced: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {orderData.qtyOrdered} (ordered quantity)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("priority")}</label>
                <SelectMagic 
                  value={formData.priority} 
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="LOW">{t("low") || "LOW"}</option>
                  <option value="MEDIUM">{t("medium") || "MEDIUM"}</option>
                  <option value="HIGH">{t("high") || "HIGH"}</option>
                </SelectMagic>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link href={`/production/orders/${orderId}`}>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {common("cancel")}
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? common("saving") : common("saveChanges")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* BOM Scaling Information */}
      {orderData.bom && (
        <Card>
          <CardHeader>
            <CardTitle>BOM Scaling Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>BOM Recipe:</strong> {orderData.bom.name}</p>
              <p><strong>BOM Output:</strong> {orderData.bom.outputQuantity} units per recipe</p>
              <p><strong>Production Quantity:</strong> {orderData.qtyOrdered} units</p>
              <p><strong>Scaling Factor:</strong> {(orderData.qtyOrdered / orderData.bom.outputQuantity).toFixed(3)}x</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-blue-800 font-medium">
                  📌 Material consumption will be automatically calculated based on the scaling factor
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Example: If BOM needs 20kg for {orderData.bom.outputQuantity} units, 
                  for {orderData.qtyOrdered} units it will consume {((20 * orderData.qtyOrdered) / orderData.bom.outputQuantity).toFixed(2)}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
