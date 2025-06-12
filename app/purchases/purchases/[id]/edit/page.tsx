// app/[locale]/dashboard/purchases/[id]/edit/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";

// Interfaces (can be moved to a types file)
interface Supplier { id: string; companyName: string; }
interface Product { id: string; name: string; sku: string; unit: string; }
interface PurchaseOrderItemOriginal {
  id: string; // DB ID of the purchase item
  productId: string;
  product: Product; // Included from backend
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
  totalCost: number;
}
interface PurchaseOrderFull {
  id: string;
  poNumber: string;
  supplierId?: string | null;
  supplier?: Supplier | null;
  orderDate: string;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: string;
  notes?: string | null;
  totalAmount: number;
  items: PurchaseOrderItemOriginal[];
}
interface PurchaseOrderItemForm {
  dbId?: string; // To track existing items from DB
  clientId: string; // Client-side ID for list key & new items
  productId: string;
  productName?: string;
  productUnit?: string;
  qtyOrdered: string;
  unitCost: string;
  qtyReceived: string; // Now editable
  totalCost?: number;
}

const newEmptyItemForm = (dbItem?: PurchaseOrderItemOriginal): PurchaseOrderItemForm => ({
  dbId: dbItem?.id,
  clientId: crypto.randomUUID(),
  productId: dbItem?.productId || "",
  productName: dbItem?.product?.name || "",
  productUnit: dbItem?.product?.unit || "",
  qtyOrdered: dbItem?.qtyOrdered?.toString() || "1",
  unitCost: dbItem?.unitCost?.toString() || "0",
  qtyReceived: dbItem?.qtyReceived?.toString() || "0",
  totalCost: dbItem?.totalCost || 0,
});


export default function EditPurchaseOrderPage({ params: routeParams }: { params: { locale: string; id: string } }) {
  const locale = routeParams.locale;
  const poId = routeParams.id;
  const router = useRouter();
  const t = useTranslations("purchases");
  const commonT = useTranslations("common");
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [poNumber, setPoNumber] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string | undefined>("");
  const [orderDate, setOrderDate] = useState<Date | undefined>();
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();
  const [receivedOnDate, setReceivedOnDate] = useState<Date | undefined>(); // For receivedDate field
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<PurchaseOrderItemForm[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [originalStatus, setOriginalStatus] = useState<string>("");


  const populateForm = useCallback((po: PurchaseOrderFull) => {
    setPoNumber(po.poNumber);
    setSupplierId(po.supplierId || undefined);
    setOrderDate(po.orderDate ? new Date(po.orderDate) : undefined);
    setExpectedDate(po.expectedDate ? new Date(po.expectedDate) : undefined);
    setReceivedOnDate(po.receivedDate ? new Date(po.receivedDate) : undefined);
    setStatus(po.status);
    setOriginalStatus(po.status); // Keep track of original status
    setNotes(po.notes || "");
    setItems(po.items.map(item => newEmptyItemForm(item)));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const [suppliersRes, productsRes, poRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/inventory?isRawMaterial=true"),
          fetch(`/api/purchases/${poId}`)
        ]);

        if (suppliersRes.ok) setSuppliers((await suppliersRes.json()).suppliers || []);
        if (productsRes.ok) setProducts((await productsRes.json()).products || []);

        if (poRes.status === 404) {
          setNotFound(true);
          toast({ title: commonT("error"), description: t("poNotFound"), variant: "destructive" });
          setIsFetching(false);
          return;
        }
        if (!poRes.ok) throw new Error(t("errorFetchPO") || "Failed to fetch PO details");
        const poData = await poRes.json();
        populateForm(poData.purchase);

      } catch (error: any) {
        console.error("Failed to fetch data for PO edit:", error);
        toast({ title: commonT("error"), description: error.message, variant: "destructive" });
        // Potentially redirect if PO fetch fails badly
      } finally {
        setIsFetching(false);
      }
    }
    if (poId) fetchData();
  }, [poId, toast, t, commonT, populateForm]);

  const handleItemChange = (index: number, field: keyof PurchaseOrderItemForm, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    (item[field] as any) = value;

    if (field === "productId") {
        const selectedProduct = products.find(p => p.id === value);
        item.productName = selectedProduct?.name;
        item.productUnit = selectedProduct?.unit;
    }

    const qty = parseFloat(item.qtyOrdered);
    const cost = parseFloat(item.unitCost);
    item.totalCost = (qty && cost) ? qty * cost : 0;

    setItems(newItems);
  };

  const addItem = () => setItems([...items, newEmptyItemForm()]);
  const removeItem = (index: number) => {
    // Here, if item has dbId, it means it's an existing item.
    // The backend PUT for purchases currently replaces all items.
    // So, removing from client state is enough.
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const validateForm = (): boolean => {
    // Similar validation as New PO page
    const errors: Record<string, string> = {};
    if (!poNumber.trim()) errors.poNumber = t("poNumberRequired") || "PO Number is required.";
    if (!orderDate) errors.orderDate = t("orderDateRequired") || "Order Date is required.";
     if (!supplierId && status !== 'DRAFT') errors.supplierId = t("supplierRequiredForConfirmed") || "Supplier is required unless status is Draft.";
    if (items.length === 0) errors.items = t("atLeastOneItem") || "At least one item is required.";
    items.forEach((item, index) => {
      if (!item.productId) errors[`item_productId_${index}`] = t("productRequired") || "Product is required.";
      if (parseFloat(item.qtyOrdered) <= 0) errors[`item_qtyOrdered_${index}`] = t("qtyMustBePositive") || "Quantity must be positive.";
      if (parseFloat(item.unitCost) < 0) errors[`item_unitCost_${index}`] = t("costCannotBeNegative") || "Unit cost cannot be negative.";
      if (status === "RECEIVED" && parseFloat(item.qtyReceived) < 0) {
        errors[`item_qtyReceived_${index}`] = t("qtyReceivedCannotBeNegative") || "Received Qty cannot be negative.";
      }
      if (status === "RECEIVED" && parseFloat(item.qtyReceived) > parseFloat(item.qtyOrdered)) {
        // errors[`item_qtyReceived_${index}`] = t("qtyReceivedExceedsOrdered") || "Received Qty cannot exceed ordered.";
        // This might be allowed depending on business rules (over-delivery)
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || notFound) {
      toast({ title: commonT("error"), description: t("validationFailed"), variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const purchaseData = {
      supplierId: supplierId || undefined,
      poNumber,
      orderDate: orderDate?.toISOString(),
      expectedDate: expectedDate?.toISOString(),
      receivedDate: (status === "RECEIVED") ? (receivedOnDate || new Date()).toISOString() : undefined,
      status,
      notes,
      items: items.map(item => ({
        // id: item.dbId, // The backend PUT /api/purchases/[id] currently replaces all items, so sending item ID is not needed.
                        // If backend supported partial updates or item diffing, this would be different.
        productId: item.productId,
        qtyOrdered: parseFloat(item.qtyOrdered),
        unitCost: parseFloat(item.unitCost),
        qtyReceived: (status === "RECEIVED" || originalStatus === "RECEIVED") ? parseFloat(item.qtyReceived) : undefined, // Only send if relevant
      })),
    };

    try {
      const response = await fetch(`/api/purchases/${poId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorUpdatePO") || "Failed to update purchase order");
      }
      toast({ title: t("success"), description: t("poUpdatedSuccess") || "Purchase order updated." });
      router.push(`/${locale}/dashboard/purchases`);
    } catch (err: any)      {
      toast({ title: commonT("error"), description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("loading") || "Loading..."}</p></div>;
  if (notFound) return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card><CardHeader><CardTitle>{t("poNotFoundTitle") || "Not Found"}</CardTitle></CardHeader>
      <CardContent><p>{t("poNotFound") || "Purchase Order not found."}</p>
      <Link href={`/${locale}/dashboard/purchases`} passHref className="mt-4 inline-block"><Button variant="outline"><ArrowLeft /> {t("backPOList")}</Button></Link>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("editPOTitle") || "Edit Purchase Order"} {poNumber}</h2>
        <Link href={`/${locale}/dashboard/purchases`} passHref>
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />{t("backPOList") || "Back to List"}</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PO Header Fields - similar to New PO form */}
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
                  {/* Add other statuses like CANCELLED if applicable */}
                </SelectContent>
              </Select>
            </div>
            {status === "RECEIVED" && (
                 <div>
                    <Label htmlFor="receivedOnDate">{t("receivedOnDate") || "Received Date"}</Label>
                    <DatePicker date={receivedOnDate} setDate={setReceivedOnDate} />
                 </div>
            )}
             <div>
              <Label htmlFor="notes">{t("notes") || "Notes"}</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* PO Items - similar to New PO form, but with qtyReceived field */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("poItems") || "Items"}</CardTitle>
            <Button type="button" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />{t("addItem") || "Add Item"}</Button>
          </CardHeader>
          <CardContent>
            {items.map((item, index) => (
              <div key={item.clientId} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 p-3 border rounded-md">
                <div className="md:col-span-3"> {/* Product */}
                  <Label>{t("product")}</Label>
                  <Select value={item.productId} onValueChange={v => handleItemChange(index, "productId", v)}>
                    <SelectTrigger><SelectValue placeholder={t("selectProduct")} /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
                  </Select>
                  {formErrors[`item_productId_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_productId_${index}`]}</p>}
                </div>
                <div className="md:col-span-2">{/* Qty Ordered */}
                  <Label>{t("quantity")} ({item.productUnit || 'units'})</Label>
                  <Input type="number" value={item.qtyOrdered} onChange={e => handleItemChange(index, "qtyOrdered", e.target.value)} min="0.01" step="0.01"/>
                  {formErrors[`item_qtyOrdered_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_qtyOrdered_${index}`]}</p>}
                </div>
                <div className="md:col-span-2">{/* Unit Cost */}
                  <Label>{t("unitCost")}</Label>
                  <Input type="number" value={item.unitCost} onChange={e => handleItemChange(index, "unitCost", e.target.value)} min="0" step="0.01"/>
                  {formErrors[`item_unitCost_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_unitCost_${index}`]}</p>}
                </div>
                {(status === "RECEIVED" || originalStatus === "RECEIVED") && (
                  <div className="md:col-span-2">{/* Qty Received */}
                    <Label>{t("qtyReceived")}</Label>
                    <Input type="number" value={item.qtyReceived} onChange={e => handleItemChange(index, "qtyReceived", e.target.value)} min="0" step="0.01"/>
                    {formErrors[`item_qtyReceived_${index}`] && <p className="text-sm text-red-500 mt-1">{formErrors[`item_qtyReceived_${index}`]}</p>}
                  </div>
                )}
                <div className="md:col-span-1 self-end">{/* Total */}
                  <Label>{t("totalItemCost")}</Label>
                  <p className="font-semibold py-2">{item.totalCost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="md:col-span-1 self-end flex justify-end"> {/* Remove button */}
                 {items.length > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-5 w-5 text-red-500" /></Button>}
                </div>
              </div>
            ))}
            {formErrors.items && <p className="text-sm text-red-500 mt-1 mb-2">{formErrors.items}</p>}
            <div className="text-right mt-4"><p className="text-xl font-bold">{t("grandTotal") || "Grand Total"}: {calculateGrandTotal().toFixed(2)}</p></div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard/purchases`)} disabled={isLoading}>{commonT("cancel") || "Cancel"}</Button>
          <Button type="submit" disabled={isLoading || isFetching}>{isLoading ? (commonT("saving") || "Saving...") : (commonT("saveChanges") || "Save Changes")}</Button>
        </div>
      </form>
    </div>
  );
}
