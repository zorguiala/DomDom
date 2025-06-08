"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ProductionOrderWithDetails, ProductionOrderFormData } from "@/types/production";

const productionOrderSchema = z.object({
  notes: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  qtyProduced: z.coerce.number().min(0, "Quantity produced must be non-negative"),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"]), // Add more if needed
  expectedEndDate: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format for expected end date",
  }),
});


export default function ProductionOrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("production");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [order, setOrder] = useState<ProductionOrderFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const orderId = params?.id as string;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      notes: "",
      priority: "MEDIUM",
      qtyProduced: 0,
      status: "PLANNED",
      expectedEndDate: "",
    }
  });

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      fetch(`/api/production/orders/${orderId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to fetch order: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data: ProductionOrderWithDetails) => {
          const formData: ProductionOrderFormData = {
            id: data.id,
            orderNumber: data.orderNumber,
            productId: data.productId,
            productName: data.product?.name,
            bomId: data.bomId,
            bomName: data.bom?.name,
            qtyOrdered: data.qtyOrdered,
            qtyProduced: data.qtyProduced || 0,
            status: data.status || "PLANNED",
            priority: data.priority || "MEDIUM",
            expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate).toISOString().split('T')[0] : "",
            notes: data.notes || "",
          };
          setOrder(formData);
          reset(formData); // Pre-fill form with fetched data
          setApiError(null);
        })
        .catch((err) => {
          console.error(err);
          setApiError(err.message);
          toast({
            variant: "destructive",
            title: t("errorFetchingOrderTitle") || "Error",
            description: err.message || t("errorFetchingOrderDesc"),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, reset, t, toast]);

  const onSubmit = async (data: ProductionOrderFormData) => {
    if (!orderId) return;
    setIsSubmitting(true);
    setApiError(null);

    const payload: Partial<ProductionOrderFormData> = {
        status: data.status,
        qtyProduced: Number(data.qtyProduced),
        priority: data.priority,
        notes: data.notes,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate).toISOString() : null,
    };

    try {
      const res = await fetch(`/api/production/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to update order");
      }

      toast({
        title: t("orderUpdatedTitle") || "Order Updated",
        description: t("orderUpdatedDesc") || "The production order has been successfully updated.",
      });
      // Optionally redirect to detail page or refresh data
      router.push(`/production/orders/${orderId}`);
      // Or fetch fresh data:
      // const freshData = await res.json();
      // setOrder(freshData);
      // reset(freshData);

    } catch (err: any) {
      console.error("Update error:", err);
      setApiError(err.message);
      toast({
        variant: "destructive",
        title: t("errorUpdatingOrderTitle") || "Update Failed",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  if (!order && !loading) return <div className="text-red-500 text-center p-4">{t("orderNotFoundOrError", { error: apiError || "" })}</div>;
  // Show apiError specifically if order data is available but a previous fetch failed
  if (apiError && !order) return <div className="text-red-500 text-center p-4">{apiError}</div>;


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("editProductionOrderTitle")} - {order?.orderNumber}</h2>
        <Link href={`/production/orders/${orderId}`}>
            <Button variant="outline">{common("cancel")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetails")}</CardTitle>
          <CardDescription>
            {common("orderNumber")}: {order?.orderNumber} | {common("product")}: {order?.productName} | {common("bom")}: {order?.bomName || common("na")} | {t("qtyOrdered")}: {order?.qtyOrdered}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">{t("status")}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">{t("planned") || "PLANNED"}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t("inProgress") || "IN_PROGRESS"}</SelectItem>
                        <SelectItem value="DONE">{t("done") || "DONE"}</SelectItem>
                        <SelectItem value="CANCELLED">{t("cancelled") || "CANCELLED"}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm font-medium text-destructive">{errors.status.message}</p>}
              </div>

              {/* Quantity Produced */}
              <div>
                <label htmlFor="qtyProduced" className="block text-sm font-medium text-gray-700">{t("qtyProduced")}</label>
                <Controller
                  name="qtyProduced"
                  control={control}
                  render={({ field }) => <Input id="qtyProduced" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
                />
                {errors.qtyProduced && <p className="text-sm font-medium text-destructive">{errors.qtyProduced.message}</p>}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">{t("priority")}</label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value || ""} value={field.value || ""}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder={t("selectPriority")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">{t("low") || "LOW"}</SelectItem>
                        <SelectItem value="MEDIUM">{t("medium") || "MEDIUM"}</SelectItem>
                        <SelectItem value="HIGH">{t("high") || "HIGH"}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.priority && <p className="text-sm font-medium text-destructive">{errors.priority.message}</p>}
              </div>

              {/* Expected End Date */}
              <div>
                <label htmlFor="expectedEndDate" className="block text-sm font-medium text-gray-700">{t("expectedEndDate")}</label>
                <Controller
                  name="expectedEndDate"
                  control={control}
                  render={({ field }) => <Input id="expectedEndDate" type="date" {...field} value={field.value || ""} />}
                />
                {errors.expectedEndDate && <p className="text-sm font-medium text-destructive">{errors.expectedEndDate.message}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">{t("notes")}</label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <Textarea id="notes" {...field} value={field.value || ""} placeholder={t("enterNotesPlaceholder")} rows={4} />}
              />
              {errors.notes && <p className="text-sm font-medium text-destructive">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <Link href={`/production/orders/${orderId}`}>
                <Button type="button" variant="outline" disabled={isSubmitting}>{common("cancel")}</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? common("saving") : common("saveChanges")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// The schema for validation (productionOrderSchema) is already defined above.
