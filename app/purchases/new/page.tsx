"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetSuppliers } from "../data/use-get-suppliers/use-get-suppliers";
import { useTranslations } from "@/lib/language-context";

function SupplierSelector() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("purchases");
  const common = useTranslations("common");
  
  const { data: suppliers = [], isPending } = useGetSuppliers();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSupplierSelect = (supplierId: string) => {
    router.push(`/purchases/new/${supplierId}`);
  };

  if (isPending) {
    return <div>{common("loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("createNewPurchaseOrder")}</CardTitle>
          <p className="text-sm text-gray-600">{t("selectSupplierDescription")}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">{t("searchSuppliers")}</Label>
              <Input
                id="search"
                placeholder={t("searchSuppliersPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSuppliers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? t("noSuppliersFound") : t("noSuppliersAvailable")}
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSupplierSelect(supplier.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{supplier.companyName}</h3>
                        {supplier.email && (
                          <p className="text-sm text-gray-600">{supplier.email}</p>
                        )}
                        {supplier.phone && (
                          <p className="text-sm text-gray-600">{supplier.phone}</p>
                        )}
                        {supplier.address && (
                          <p className="text-sm text-gray-500 mt-1">{supplier.address}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSupplierSelect(supplier.id);
                        }}
                      >
                        {t("select")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                {common("cancel")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/suppliers/new")}
              >
                {t("addNewSupplier")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPurchaseOrderPage() {
  return <SupplierSelector />;
} 