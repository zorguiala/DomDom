"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface Product { id: string; name: string; }
interface BillOfMaterial { id: string; name: string; }

const productionOrderSchema = z.object({
  orderNumber: z.string().optional().nullable(),
  productId: z.string().min(1, "Product is required"),
  bomId: z.string().optional().nullable(),
  qtyOrdered: z.preprocess(
    val => Number(String(val).replace(/[^0-9.-]+/g, "")),
    z.number({invalid_type_error: "Quantity must be a number"}).min(1, "Quantity must be at least 1")
  ),
  status: z.string().default("PLANNED"),
  priority: z.string().default("MEDIUM"),
  startDate: z.date().optional().nullable(),
  expectedEndDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(data => !data.expectedEndDate || !data.startDate || data.expectedEndDate >= data.startDate, {
  message: "Expected end date must be after start date",
  path: ["expectedEndDate"],
});

export type ProductionOrderFormData = z.infer<typeof productionOrderSchema>;

export default function ProductionOrderCreatePage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBOMs] = useState<BillOfMaterial[]>([]);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      orderNumber: "",
      productId: "",
      bomId: "",
      qtyOrdered: 1,
      status: "PLANNED",
      priority: "MEDIUM",
      startDate: null,
      expectedEndDate: null,
      notes: "",
    },
  });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => toast({ variant: "destructive", title: common("error"), description: t("errorFetchingProducts") || "Failed to fetch products."}));

    fetch("/api/production/bom")
      .then((res) => res.json())
      .then(setBOMs)
      .catch(() => toast({ variant: "destructive", title: common("error"), description: t("errorFetchingBOMs") || "Failed to fetch BOMs."}));
  }, [toast, common, t]);

  const onSubmit = async (data: ProductionOrderFormData) => {
    try {
      const payload = {
        ...data,
        startDate: data.startDate ? data.startDate.toISOString().split('T')[0] : null,
        expectedEndDate: data.expectedEndDate ? data.expectedEndDate.toISOString().split('T')[0] : null,
        qtyOrdered: Number(data.qtyOrdered)
      };
      const res = await fetch("/api/production/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Assuming errorData.details might be an array of Zod issues
        const errorMessage = Array.isArray(errorData.details)
          ? errorData.details.map((d: any) => `${d.path?.join('.') || 'error'}: ${d.message}`).join(', ')
          : errorData.error;
        throw new Error(errorMessage || t("errorCreatingOrder"));
      }
      toast({ title: t("orderCreatedTitle") || "Order Created", description: t("orderCreatedDesc") || "Production order successfully created."});
      router.push("/production/orders");
    } catch (err: any) {
      toast({ variant: "destructive", title: common("error"), description: err.message });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("createOrder")}</h2>
        <Link href="/production/orders">
          <Button variant="outline">{common("backToList")}</Button>
        </Link>
      </div>
      <Card>
        <CardContent className="mt-6"> {/* Added mt-6 for padding, assuming CardHeader might be removed or not used */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Responsive grid layout */}
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium mb-1">{t("orderNumber")} ({common("optional")})</label>
                <Controller name="orderNumber" control={control} render={({ field }) => <Input id="orderNumber" {...field} value={field.value ?? ""} />} />
                {errors.orderNumber && <p className="text-sm text-destructive mt-1">{errors.orderNumber.message}</p>}
              </div>

              <div>
                <label htmlFor="productId" className="block text-sm font-medium mb-1">{t("product")}</label>
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder={t("selectProduct")} /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productId && <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>}
              </div>

              <div>
                <label htmlFor="bomId" className="block text-sm font-medium mb-1">{t("bom")} ({common("optional")})</label>
                <Controller
                  name="bomId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder={t("selectBOM")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{common("none") || "None"}</SelectItem>
                        {boms.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bomId && <p className="text-sm text-destructive mt-1">{errors.bomId.message}</p>}
              </div>

              <div>
                <label htmlFor="qtyOrdered" className="block text-sm font-medium mb-1">{t("qtyOrdered")}</label>
                <Controller
                  name="qtyOrdered"
                  control={control}
                  render={({ field }) => <Input id="qtyOrdered" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />}
                />
                {errors.qtyOrdered && <p className="text-sm text-destructive mt-1">{errors.qtyOrdered.message}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">{t("status")}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder={t("selectStatus")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">{t("planned")}</SelectItem>
                        <SelectItem value="IN_PROGRESS" disabled>{t("inProgress")}</SelectItem> {/* Typically not set at creation */}
                        <SelectItem value="DONE" disabled>{t("done")}</SelectItem> {/* Typically not set at creation */}
                        <SelectItem value="CANCELLED" disabled>{t("cancelled")}</SelectItem> {/* Typically not set at creation */}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">{t("priority")}</label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder={t("selectPriority")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">{t("low")}</SelectItem>
                        <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
                        <SelectItem value="HIGH">{t("high")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>}
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">{t("startDate")} ({common("optional")})</label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      placeholder={common("selectPlaceholder") || "Select start date"}
                    />
                  )}
                />
                {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
              </div>

              <div>
                <label htmlFor="expectedEndDate" className="block text-sm font-medium mb-1">{t("expectedEndDate")} ({common("optional")})</label>
                <Controller
                  name="expectedEndDate"
                  control={control}
                  render={({ field }) => (
                     <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      placeholder={common("selectPlaceholder") || "Select expected end date"}
                    />
                  )}
                />
                {errors.expectedEndDate && <p className="text-sm text-destructive mt-1">{errors.expectedEndDate.message}</p>}
              </div>
            </div> {/* End of grid */}

            <div className="col-span-full"> {/* This should be outside the grid to span full width */}
              <label htmlFor="notes" className="block text-sm font-medium mb-1">{t("notes")} ({common("optional")})</label>
              <Controller name="notes" control={control} render={({ field }) => <Textarea id="notes" {...field} value={field.value ?? ""} />} />
              {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
               <Link href="/production/orders">
                <Button type="button" variant="outline" disabled={isSubmitting}>{common("cancel")}</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? common("creating") : t("createOrder")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
