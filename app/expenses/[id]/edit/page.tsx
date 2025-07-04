'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ExpenseFormData, Expense } from '@/types/expenses';
import { DatePicker } from '@/components/ui/date-picker';

const editExpenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  totalAmount: z.number().positive('Amount must be positive'),
  expenseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD or ISO string",
  }),
  paymentMethod: z.string().optional().nullable().or(z.literal('')),
  receipt: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
});

// Use Zod inferred type to ensure perfect alignment
type EditExpenseFormData = z.infer<typeof editExpenseFormSchema>;

interface Category {
  id: string;
  name: string;
}

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('expenses');
  const common = useTranslations('common');
  const { toast } = useToast();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const expenseId = params?.id as string;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditExpenseFormData>({
    resolver: zodResolver(editExpenseFormSchema),
    defaultValues: {
      description: '',
      categoryId: '',
      totalAmount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      receipt: '',
      notes: '',
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/expenses/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch categories.', variant: 'destructive' });
      }
    };

    fetchCategories();

    if (expenseId) {
      setLoading(true);
      fetch(`/api/expenses/${expenseId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || t("errorFetchingExpense"));
          }
          return res.json();
        })
        .then((data: Expense) => {
          setExpense(data);
          const formData: EditExpenseFormData = {
            description: data.description,
            categoryId: data.categoryId,
            totalAmount: data.totalAmount,
            expenseDate: new Date(data.expenseDate).toISOString().split('T')[0],
            paymentMethod: data.paymentMethod,
            receipt: data.receipt,
            notes: data.notes,
          };
          reset(formData);
          setApiError(null);
        })
        .catch((err) => {
          console.error(err);
          setApiError(err.message);
          toast({ variant: "destructive", title: t("errorFetchingExpenseTitle"), description: err.message });
        })
        .finally(() => setLoading(false));
    }
  }, [expenseId, reset, t, toast]);

  const onSubmit = async (data: EditExpenseFormData) => {
    if (!expenseId) return;
    setApiError(null);

    const payload = {
      ...data,
      expenseDate: new Date(data.expenseDate).toISOString().split('T')[0],
      totalAmount: Number(data.totalAmount)
    };

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || t("errorUpdatingExpense"));
      }

      toast({
        title: t("expenseUpdatedTitle") || "Expense Updated",
        description: t("expenseUpdatedDesc") || `Expense "${data.description}" updated.`,
      });
      router.push("/expenses");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setApiError(errorMessage);
      toast({ variant: "destructive", title: t("errorUpdatingExpenseTitle"), description: errorMessage });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  if (apiError && !expense) return <div className="text-red-500 text-center p-4">{apiError}</div>;
  if (!expense) return <div className="text-red-500 text-center p-4">{t("expenseNotFound")}</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("editExpenseTitle")}</h2>
          <p className="text-muted-foreground">{t("editExpenseDescription") || `Edit expense: ${expense.description}`}</p>
        </div>
        <Link href="/expenses">
          <Button variant="outline">{common("backToList")}</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="mt-6">
          {apiError && Object.keys(errors).length === 0 && <p className="text-sm font-medium text-destructive mb-4">{apiError}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">{t("descriptionField")}</label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} placeholder={t("descriptionPlaceholder")} />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium mb-1">{t("categoryField")}</label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="categoryId"
                      {...field}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t("categoryPlaceholder")}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">{t("amountField")}</label>
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      value={field.value?.toString() || ''}
                      placeholder={common("placeholderZeroAmount")} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  )}
                />
                {errors.totalAmount && <p className="text-sm text-destructive mt-1">{errors.totalAmount.message}</p>}
              </div>

              {/* Expense Date */}
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium mb-1">{t("expenseDateField")}</label>
                <Controller
                  name="expenseDate"
                  control={control}
                  render={({ field }) => (
                     <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    />
                  )}
                />
                {errors.expenseDate && <p className="text-sm text-destructive mt-1">{errors.expenseDate.message}</p>}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">{t("paymentMethodField")}</label>
                <Controller name="paymentMethod" control={control} render={({ field }) => <Input id="paymentMethod" {...field} value={field.value ?? ""} placeholder={t("paymentMethodPlaceholder")} />} />
                {errors.paymentMethod && <p className="text-sm text-destructive mt-1">{errors.paymentMethod.message}</p>}
              </div>
            </div>

            {/* Receipt URL/Reference */}
            <div>
                <label htmlFor="receipt" className="block text-sm font-medium mb-1">{t("receiptField")}</label>
                <Controller name="receipt" control={control} render={({ field }) => <Input id="receipt" {...field} value={field.value ?? ""} placeholder={t("receiptPlaceholder")} />} />
                {errors.receipt && <p className="text-sm text-destructive mt-1">{errors.receipt.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">{t("notesField")}</label>
              <Controller name="notes" control={control} render={({ field }) => <Textarea id="notes" {...field} value={field.value ?? ""} placeholder={t("notesPlaceholder")} rows={3} />} />
              {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/expenses">
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