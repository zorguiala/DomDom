"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/language-context";

interface PurchaseOrderHeaderProps {
  poNumber: string;
  orderDate: string;
  expectedDate: string;
  notes: string;
  onOrderDateChange: (date: string) => void;
  onExpectedDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
}

export function PurchaseOrderHeader({
  poNumber,
  orderDate,
  expectedDate,
  notes,
  onOrderDateChange,
  onExpectedDateChange,
  onNotesChange,
}: PurchaseOrderHeaderProps) {
  const t = useTranslations("purchases");
  const common = useTranslations("common");
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <Label>{t("poNumber")}</Label>
        <Input value={poNumber} disabled />
      </div>
      <div>
        <Label>{t("orderDate")}</Label>
        <Input
          type="date"
          value={orderDate}
          onChange={(e) => onOrderDateChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>{t("expectedDate")}</Label>
        <Input
          type="date"
          value={expectedDate}
          onChange={(e) => onExpectedDateChange(e.target.value)}
          placeholder={t("dateFormatPlaceholder")}
        />
      </div>
      <div>
        <Label>{common("notes")}</Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t("optionalNotes")}
        />
      </div>
    </div>
  );
} 