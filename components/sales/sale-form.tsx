"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/language-context";
import { useCreateSale } from "@/hooks/sales/use-sales";
import { useProducts } from "@/hooks/sales/use-products";
import { SaleType, CreateSaleInput } from "@/types/sales";
import { SaleItemsForm } from "./sale-items-form";
import { CustomerInfoForm } from "./customer-info-form";
import { VanInfoForm } from "./van-info-form";
import { SaleSummary } from "./sale-summary";

// Match the interfaces from the form components
interface VanInfo {
  vanId?: string;
  driverName: string;
  route: string;
  departureTime?: string;
  expectedReturnTime?: string;
  vanNotes?: string;
  isVanOperation: boolean;
}

interface CustomerInfo {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
}
import { useSaleCalculations } from "@/hooks/sales/use-sale-calculations";
import { ArrowLeft, FileText, Package } from "lucide-react";
import Link from "next/link";

interface SaleFormProps {
  type: SaleType;
}

export function SaleForm({ type }: SaleFormProps) {
  const router = useRouter();
  const t = useTranslations("sales");
  const common = useTranslations("common");
  
  const createSale = useCreateSale();
  const { data: products = [] } = useProducts({ finishedGoodsOnly: true });
  
  // Form state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [vanInfo, setVanInfo] = useState<VanInfo>({
    driverName: "",
    route: "",
    vanId: "",
    isVanOperation: type === "DOOR_TO_DOOR",
  });
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([]);
  
  const totals = useSaleCalculations(items, type);
  
  const handleSubmit = () => {
    const input: CreateSaleInput = {
      type,
      customerName: customerInfo.customerName || (type === "DOOR_TO_DOOR" ? "Van Sale" : ""),
      customerEmail: customerInfo.customerEmail,
      customerPhone: customerInfo.customerPhone,
      driverName: vanInfo.driverName,
      vehicleNumber: vanInfo.vanId,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    
    createSale.mutate(input, {
      onSuccess: () => {
        router.push("/sales");
      },
    });
  };
  
  const isValid = () => {
    if (type === "CLASSIC" && !customerInfo.customerName) return false;
    if (type === "DOOR_TO_DOOR" && (!vanInfo.driverName || !vanInfo.route)) return false;
    return items.length > 0;
  };
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/sales">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {common("back")}
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {type === "DOOR_TO_DOOR" ? t("newVanSale") : t("newClassicSale")}
            </h2>
            <p className="text-muted-foreground">
              {type === "DOOR_TO_DOOR" ? t("vanSaleDescription") : t("classicSaleDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer/Driver Information */}
        {type === "DOOR_TO_DOOR" ? (
          <VanInfoForm
            vanInfo={vanInfo}
            onVanInfoChange={setVanInfo}
            showVanFields={true}
          />
        ) : (
          <CustomerInfoForm
            customerInfo={customerInfo}
            onCustomerInfoChange={setCustomerInfo}
          />
        )}

        {/* Add Items */}
        <SaleItemsForm
          products={products}
          items={items}
          onItemsChange={setItems}
        />
      </div>

      {/* Summary and Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{common("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("placeholderNotes")}
              rows={4}
            />
          </CardContent>
        </Card>

        <SaleSummary
          totals={{...totals, itemCount: items.length}}
          saleType={type}
          onSubmit={handleSubmit}
          isSubmitting={createSale.isPending}
          isValid={isValid()}
        />
      </div>
    </div>
  );
}