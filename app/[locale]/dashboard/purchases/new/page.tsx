// app/[locale]/dashboard/purchases/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming a DatePicker component
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

interface Supplier {
  id: string;
  companyName: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string; // To display alongside quantity
  priceCost?: number; // For pre-filling unit cost
}

interface PurchaseOrderItemForm {
  id: string; // Temporary client-side ID for list key
  productId: string;
  productName?: string; // For display
  productUnit?: string; // For display
  qtyOrdered: string; // string for input field
  unitCost: string;   // string for input field
  totalCost?: number;
}

const newEmptyItem = (): PurchaseOrderItemForm => ({
  id: crypto.randomUUID(),
  productId: "",
  qtyOrdered: "1",
  unitCost: "0",
  totalCost: 0,
});

export default function NewPurchaseOrderPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const router = useRouter();
  const t = useTranslations("purchases");
  const commonT = useTranslations("common");
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierId, setSupplierId] = useState<string>("");
  const [poNumber, setPoNumber] = useState<string>("");
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>("DRAFT");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<PurchaseOrderItemForm[]>([newEmptyItem()]);

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/inventory?isRawMaterial=true") // Assuming API supports this filter
        ]);
        if (suppliersRes.ok) setSuppliers((await suppliersRes.json()).suppliers || []);
        if (productsRes.ok) setProducts((await productsRes.json()).products || []);
      } catch (error) {
        console.error("Failed to fetch suppliers or products", error);
        toast({ title: commonT("error"), description: t("errorFetchSuppliesProducts"), variant: "destructive" });
      }
    }
    fetchData();
  }, [toast, t, commonT]);

  const handleItemChange = (index: number, field: keyof PurchaseOrderItemForm, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    (item[field] as any) = value;

    if (field === "productId") {
        const selectedProduct = products.find(p => p.id === value);
        item.productName = selectedProduct?.name;
        item.productUnit = selectedProduct?.unit;
        if (selectedProduct?.priceCost) { // Pre-fill unit cost if available
            item.unitCost = selectedProduct.priceCost.toString();
        }
    }

    const qty = parseFloat(item.qtyOrdered);
    const cost = parseFloat(item.unitCost);
    item.totalCost = (qty && cost) ? qty * cost : 0;

    setItems(newItems);
  };

  const addItem = () => setItems([...items, newEmptyItem()]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const calculateGrandTotal = () => items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!poNumber.trim()) errors.poNumber = t("poNumberRequired") || "PO Number is required.";
    if (!orderDate) errors.orderDate = t("orderDateRequired") || "Order Date is required.";
    if (!supplierId && status !== 'DRAFT') errors.supplierId = t("supplierRequiredForConfirmed") || "Supplier is required unless status is Draft.";
    if (items.length === 0) errors.items = t("atLeastOneItem") || "At least one item is required.";
    items.forEach((item, index) => {
      if (!item.productId) errors[`item_productId_${index}`] = t("productRequired") || "Product is required.";
      if (parseFloat(item.qtyOrdered) <= 0) errors[`item_qtyOrdered_${index}`] = t("qtyMustBePositive") || "Quantity must be positive.";
      if (parseFloat(item.unitCost) < 0) errors[`item_unitCost_${index}`] = t("costCannotBeNegative") || "Unit cost cannot be negative.";
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: commonT("error"), description: t("validationFailed"), variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const purchaseData = {
      supplierId: supplierId || undefined, // Prisma handles undefined for optional relations
      poNumber,
      orderDate: orderDate?.toISOString(),
      expectedDate: expectedDate?.toISOString(),
      status,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        // For new products, API expects sku, name, unit. This form assumes existing products.
        // If creating products on the fly was needed, form would be more complex.
        qtyOrdered: parseFloat(item.qtyOrdered),
        unitCost: parseFloat(item.unitCost),
        // qtyReceived is handled by backend or later in receiving process
      })),
    };

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorCreatePO") || "Failed to create purchase order");
      }
      toast({ title: t("success"), description: t("poCreatedSuccess") || "Purchase order created." });
      router.push(`/${locale}/dashboard/purchases`);
    } catch (err: any) {
      toast({ title: commonT("error"), description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("newPOTitle") || "New Purchase Order"}</h2>
        <Link href={`/${locale}/dashboard/purchases`} passHref>
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />{t("backPOList") || "Back to List"}</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader><CardTitle>{t("poHeader") || "Order Details"}</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="poNumber">{t("poNumber") || "PO Number"} <span className="text-red-500">*</span></Label>
              <Input id="poNumber" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
              {formErrors.poNumber && <p className="text-sm text-red-500 mt-1">{formErrors.poNumber}</p>}
            </div>
            <div>
              <Label htmlFor="supplierId">{t("supplier") || "Supplier"}</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder={t("selectSupplier") || "Select Supplier"} /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.supplierId && <p className="text-sm text-red-500 mt-1">{formErrors.supplierId}</p>}
            </div>
            <div>
              <Label htmlFor="orderDate">{t("orderDate") || "Order Date"} <span className="text-red-500">*</span></Label>
              <DatePicker date={orderDate} setDate={setOrderDate} />
              {formErrors.orderDate && <p className="text-sm text-red-500 mt-1">{formErrors.orderDate}</p>}
            </div>
            <div>
              <Label htmlFor="expectedDate">{t("expectedDate") || "Expected Date"}</Label>
              <DatePicker date={expectedDate} setDate={setExpectedDate} />
            </div>
            <div>
              <Label htmlFor="status">{t("status") || "Status"}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t("statusDRAFT") || "Draft"}</SelectItem>
                  <SelectItem value="CONFIRMED">{t("statusCONFIRMED") || "Confirmed"}</SelectItem>
                  <SelectItem value="RECEIVED">{t("statusRECEIVED") || "Received"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="notes">{t("notes") || "Notes"}</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("notesPlaceholder") || "Optional notes about the order"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("poItems") || "Items"}</CardTitle>
            <Button type="button" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />{t("addItem") || "Add Item"}</Button>
          </CardHeader>
          <CardContent>
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 p-3 border rounded-md">
                <div className="md:col-span-4">
                  <Label htmlFor={`item_productId_${index}`}>{t("product") || "Product"}</Label>
                  <Select value={item.productId} onValueChange={v => handleItemChange(index, "productId", v)}>
                    <SelectTrigger><SelectValue placeholder={t("selectProduct") || "Select Product"} /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formErrors[`item_productId_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_productId_${index}`]}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`item_qtyOrdered_${index}`}>{t("quantity") || "Quantity"} ({item.productUnit || 'units'})</Label>
                  <Input id={`item_qtyOrdered_${index}`} type="number" value={item.qtyOrdered} onChange={e => handleItemChange(index, "qtyOrdered", e.target.value)} min="0.01" step="0.01"/>
                  {formErrors[`item_qtyOrdered_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_qtyOrdered_${index}`]}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`item_unitCost_${index}`}>{t("unitCost") || "Unit Cost"}</Label>
                  <Input id={`item_unitCost_${index}`} type="number" value={item.unitCost} onChange={e => handleItemChange(index, "unitCost", e.target.value)} min="0" step="0.01"/>
                   {formErrors[`item_unitCost_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_unitCost_${index}`]}</p>}
                </div>
                <div className="md:col-span-2 self-end">
                  <Label>{t("totalItemCost") || "Total"}</Label>
                  <p className="font-semibold py-2">{item.totalCost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="md:col-span-2 self-end flex justify-end">
                  {items.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-5 w-5 text-red-500" /></Button>}
                </div>
              </div>
            ))}
            {formErrors.items && <p className="text-sm text-red-500 mt-1 mb-2">{formErrors.items}</p>}
            <div className="text-right mt-4">
              <p className="text-xl font-bold">{t("grandTotal") || "Grand Total"}: {calculateGrandTotal().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard/purchases`)} disabled={isLoading}>
                {commonT("cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? (commonT("saving") || "Saving...") : (t("createPOButton") || "Create Purchase Order")}
            </Button>
        </div>
      </form>
    </div>
  );
}
