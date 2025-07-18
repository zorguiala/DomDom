'use client';

import { useRouter } from 'next/navigation';
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
import { ExpenseFormData } from '@/types/expenses';
import { PlusCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { useEffect, useState } from 'react';

const newExpenseFormSchema = z.object({
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

type NewExpenseFormData = z.infer<typeof newExpenseFormSchema>;

interface Category {
  id: string;
  name: string;
}

export default function AddExpensePage() {
  const router = useRouter();
  const t = useTranslations('expenses');
  const common = useTranslations('common');
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewExpenseFormData>({
    resolver: zodResolver(newExpenseFormSchema),
    defaultValues: {
      description: '',
      categoryId: '',
      totalAmount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      receipt: '',
      notes: '',
    },
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
  }, [toast]);

  const onSubmit = async (data: NewExpenseFormData) => {
    try {
      const payload = {
        ...data,
        expenseDate: new Date(data.expenseDate).toISOString().split('T')[0],
        totalAmount: Number(data.totalAmount)
      };

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || t("errorCreatingExpense"));
      }

      toast({
        title: t("expenseCreatedTitle") || "Expense Created",
        description: t("expenseCreatedDesc") || `Expense "${data.description}" created.`,
      });
      router.push("/expenses");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: t("errorCreatingExpenseTitle") || "Creation Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("addExpenseTitle")}</h2>
          <p className="text-muted-foreground">{t("addExpenseDescription")}</p>
        </div>
        <Link href="/expenses">
          <Button variant="outline">{common("backToList")}</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="mt-6">
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
                  render={({ field }) => <Input id="amount" type="number" step="0.01" {...field} placeholder={common("placeholderZeroAmount")} onChange={e => field.onChange(parseFloat(e.target.value))} />}
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
                <PlusCircle className="mr-2 h-4 w-4" /> {isSubmitting ? common("creating") : t("createExpenseButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
