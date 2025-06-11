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
import { useToast } from "@/hooks/use-toast";
import { ProductionOrderWithDetails } from "@/types/production"; // Using the main detailed type
import { DatePicker } from "@/components/ui/date-picker";

// Zod schema for validation - include all fields that can be edited
const editProductionOrderSchema = z.object({
  // Fields not typically editable but needed for context or if schema requires them
  orderNumber: z.string().optional().nullable(),
  productId: z.string().min(1, "Product is required"),
  bomId: z.string().optional().nullable(),
  qtyOrdered: z.number(),

  // Editable fields
  qtyProduced: z.preprocess(
    val => Number(String(val).replace(/[^0-9.-]+/g, "")), // Clean input
    z.number({invalid_type_error: "Quantity produced must be a number"}).min(0, "Quantity produced must be non-negative")
  ),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"]),
  priority: z.string().optional().nullable(),
  startDate: z.date().optional().nullable(),
  expectedEndDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(data => !data.expectedEndDate || !data.startDate || data.expectedEndDate >= data.startDate, {
  message: "Expected end date must be after start date",
  path: ["expectedEndDate"],
});

type FormValues = z.infer<typeof editProductionOrderSchema>;

export default function ProductionOrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("production");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [displayOrderData, setDisplayOrderData] = useState<ProductionOrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const orderId = params?.id as string;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(editProductionOrderSchema),
    defaultValues: {
      orderNumber: "",
      productId: "",
      bomId: "",
      qtyOrdered: 0,
      qtyProduced: 0,
      status: "PLANNED",
      priority: "MEDIUM",
      startDate: null,
      expectedEndDate: null,
      notes: "",
    }
  });

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      fetch(`/api/production/orders/${orderId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to fetch order: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data: ProductionOrderWithDetails) => {
          setDisplayOrderData(data);

          const formDefaultValues: FormValues = {
            orderNumber: data.orderNumber,
            productId: data.productId,
            bomId: data.bomId ?? "",
            qtyOrdered: data.qtyOrdered,
            qtyProduced: data.qtyProduced ?? 0,
            status: data.status as FormValues['status'],
            priority: data.priority ?? "MEDIUM",
            startDate: data.startDate ? new Date(data.startDate) : null,
            expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
            notes: data.notes ?? "",
          };
          reset(formDefaultValues);
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
        .finally(() => setIsLoading(false));
    }
  }, [orderId, reset, t, toast]);

  const onSubmit = async (data: FormValues) => {
    if (!orderId) return;
    setApiError(null);

    // API expects only fields that are meant to be updated by this form
    const payload: Partial<FormValues> = {
        status: data.status,
        qtyProduced: Number(data.qtyProduced),
        priority: data.priority,
        notes: data.notes,
        startDate: data.startDate ? data.startDate.toISOString().split('T')[0] : null,
        expectedEndDate: data.expectedEndDate ? data.expectedEndDate.toISOString().split('T')[0] : null,
        // Do not send orderNumber, productId, bomId, qtyOrdered unless they are editable by this form
        // and the API supports updating them. The current API PUT focuses on status and progress.
    };

    try {
      const res = await fetch(`/api/production/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = Array.isArray(errorData.details)
          ? errorData.details.map((d: any) => `${d.path?.join('.') || 'error'}: ${d.message}`).join(', ')
          : (errorData.details || errorData.error);
        throw new Error(errorMessage || t("errorUpdatingOrderTitle"));
      }

      toast({
        title: t("orderUpdatedTitle") || "Order Updated",
        description: t("orderUpdatedDesc") || "The production order has been successfully updated.",
      });
      router.push(`/production/orders/${orderId}`);
    } catch (err: any) {
      console.error("Update error:", err);
      setApiError(err.message);
      toast({
        variant: "destructive",
        title: t("errorUpdatingOrderTitle") || "Update Failed",
        description: err.message,
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  if (apiError && !displayOrderData) return <div className="text-red-500 text-center p-4">{apiError}</div>;
  if (!displayOrderData && !loading) return <div className="text-red-500 text-center p-4">{t("orderNotFoundOrError", { error: apiError || "" })}</div>;
  if (!displayOrderData) return null;


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("editProductionOrderTitle")} - {displayOrderData.orderNumber}</h2>
        <Link href={`/production/orders/${orderId}`}>
            <Button variant="outline">{common("cancel")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetails")}</CardTitle>
          <CardDescription>
            {common("orderNumber")}: {displayOrderData.orderNumber} | {common("product")}: {displayOrderData.product?.name} | {common("bom")}: {displayOrderData.bom?.name || common("na")} | {t("qtyOrdered")}: {displayOrderData.qtyOrdered}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && Object.keys(errors).length === 0 && <p className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">{apiError}</p>}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">{t("status")}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>

              <div>
                <label htmlFor="qtyProduced" className="block text-sm font-medium mb-1">{t("qtyProduced")}</label>
                <Controller
                  name="qtyProduced"
                  control={control}
                  render={({ field }) => <Input id="qtyProduced" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
                {errors.qtyProduced && <p className="text-sm text-destructive mt-1">{errors.qtyProduced.message}</p>}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">{t("priority")}</label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value ?? "MEDIUM"}>
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
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">{t("notes")} ({common("optional")})</label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <Textarea id="notes" {...field} value={field.value ?? ""} placeholder={t("placeholderEnterNotes")} rows={3} />}
              />
              {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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
