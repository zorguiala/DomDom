"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGetSupplier } from "../../data/use-get-supplier/use-get-supplier";
import { PurchaseOrderHeader } from "../../components/purchase-order-header";
import { PurchaseOrderItems } from "../../components/purchase-order-items";
import { PurchaseOrderSummary } from "../../components/purchase-order-summary";
import { Product } from "@/types";
import { NewProductModal } from "@/app/components/inventory/new-product-modal";
import { useTranslations } from "@/lib/language-context";

interface OrderItem {
  productId: string;
  qty: number;
  totalCost: number;
  productInput?: string;
}

function OrderForm({ supplierId }: { supplierId: string }) {
  const { data: supplier, isLoading: loadingSupplier } = useGetSupplier(supplierId);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [poNumber] = useState(() => `PO-${Date.now()}`);
  const [orderDate, setOrderDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [expectedDate, setExpectedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState<{ open: boolean; idx: number | null; name?: string }>({ open: false, idx: null });
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("purchases");
  const common = useTranslations("common");

  const addItem = () => setItems([...items, { productId: "", qty: 1, totalCost: 0, productInput: "" }]);
  const total = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const handleProductCreated = async (product: Product) => {
    if (showNewProduct.idx !== null) {
      setItems(items => items.map((item, i) => 
        i === showNewProduct.idx 
          ? { 
              ...item, 
              productId: product.id,
              productInput: product.name 
            } 
          : item
      ));
    }
    setShowNewProduct({ open: false, idx: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplier.id,
          poNumber,
          orderDate: new Date(orderDate).toISOString(),
          expectedDate: expectedDate ? new Date(expectedDate).toISOString() : undefined,
          status: "DRAFT",
          notes,
          items: items.map(item => ({
            productId: item.productId,
            qtyOrdered: item.qty,
            unitCost: item.qty > 0 ? item.totalCost / item.qty : 0
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create purchase order");
      }
      toast({ title: t("orderCreated"), description: `${t("total")}: ${total} TND` });
      router.push("/purchases");
    } catch (err: any) {
      toast({ title: common("error"), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSupplier) return <div>{common("loading")}</div>;
  if (!supplier) return <div>{t("supplierNotFound")}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("newPurchaseOrder")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderHeader
            poNumber={poNumber}
            orderDate={orderDate}
            expectedDate={expectedDate}
            notes={notes}
            onOrderDateChange={setOrderDate}
            onExpectedDateChange={setExpectedDate}
            onNotesChange={setNotes}
          />

          <PurchaseOrderItems
            items={items}
            onItemsChange={setItems}
            onAddProduct={addItem}
            onShowNewProduct={(idx, name) => setShowNewProduct({ open: true, idx, name })}
          />

          <PurchaseOrderSummary
            total={total}
            submitting={submitting}
            onCancel={() => router.back()}
            disabled={items.length === 0}
          />
        </CardContent>
      </Card>

      {showNewProduct.open && (
        <NewProductModal
          open={showNewProduct.open}
          onClose={() => setShowNewProduct({ open: false, idx: null })}
          onCreated={handleProductCreated}
          name={showNewProduct.name}
          context="purchase"
        />
      )}
    </form>
  );
}

export default function NewPurchasePage({ params }: { params: Promise<{ supplierId: string }> }) {
  const [supplierId, setSupplierId] = useState<string | null>(null);

  useEffect(() => {
    async function unwrapParams() {
      const { supplierId: id } = await params;
      setSupplierId(id);
    }
    unwrapParams();
  }, [params]);

  if (!supplierId) {
    return <div>Loading...</div>;
  }

  return <OrderForm supplierId={supplierId} />;
} 