"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetSuppliers } from "../purchases/data/use-get-suppliers/use-get-suppliers";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { Pencil, Trash2, Plus, Search, Building, Mail, Phone, MapPin, ShoppingCart, DollarSign, Calendar, Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function SuppliersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const t = useTranslations("suppliers");
  const common = useTranslations("common");
  
  const { data: suppliers = [], isPending, refetch } = useGetSuppliers();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (supplierId: string) => {
    router.push(`/suppliers/${supplierId}/edit`);
  };

  const handleDelete = async (supplierId: string, companyName: string) => {
    if (!confirm(`${t("confirmDelete")} "${companyName}"?`)) return;
    
    setDeletingId(supplierId);
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete supplier");
      }

      toast({
        title: common("success"),
        description: t("supplierDeletedSuccessfully"),
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: common("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">{common("loading")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t("suppliers")}
            </CardTitle>
            <Button onClick={() => router.push("/suppliers/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addNewSupplier")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("manageSuppliersDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchSuppliers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Suppliers List */}
            <div className="space-y-4">
              {filteredSuppliers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? t("noSuppliersFound") : t("noSuppliersYet")}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {searchTerm ? t("tryDifferentSearch") : t("addFirstSupplier")}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push("/suppliers/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addNewSupplier")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredSuppliers.map((supplier) => (
                    <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              {supplier.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{supplier.email}</span>
                                </div>
                              )}
                              {supplier.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{supplier.phone}</span>
                                </div>
                              )}
                              {supplier.address && (
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{supplier.address}</span>
                                </div>
                              )}
                              {supplier.mf && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">MF:</span>
                                  <span>{supplier.mf}</span>
                                </div>
                              )}
                            </div>

                            {/* Purchase Order Statistics */}
                            {supplier.statistics && (
                              <div className="pt-3 border-t border-gray-100">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  <ShoppingCart className="h-3 w-3" />
                                  {t("purchaseHistory")}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3 text-blue-500" />
                                    <span className="text-gray-500">{t("totalOrders")}:</span>
                                    <span className="font-medium">{supplier.statistics.totalOrders}</span>
                                  </div>
                                  
                                  {supplier.statistics.lastOrderDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-green-500" />
                                      <span className="text-gray-500">{t("lastOrder")}:</span>
                                      <span className="font-medium">
                                        {new Date(supplier.statistics.lastOrderDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {supplier.statistics.lastOrderTotal > 0 && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3 text-yellow-500" />
                                      <span className="text-gray-500">{t("lastOrderTotal")}:</span>
                                      <span className="font-medium">
                                        {formatCurrency(supplier.statistics.lastOrderTotal)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {supplier.statistics.avgCostPerUnit > 0 && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3 text-purple-500" />
                                      <span className="text-gray-500">{t("avgCostPerUnit")}:</span>
                                      <span className="font-medium">
                                        {formatCurrency(supplier.statistics.avgCostPerUnit)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {supplier.statistics.lastOrderNumber && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {t("lastOrderNumber")}: {supplier.statistics.lastOrderNumber}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(supplier.id)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              {common("edit")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(supplier.id, supplier.companyName)}
                              disabled={deletingId === supplier.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deletingId === supplier.id ? common("deleting") : common("delete")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            {suppliers.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  {t("totalSuppliers")}: {suppliers.length}
                  {searchTerm && filteredSuppliers.length !== suppliers.length && (
                    <span> • {t("showing")}: {filteredSuppliers.length}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 