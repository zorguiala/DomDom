"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useGetProducts } from "@/app/inventory/data/use-get-products/use-get-products";
import { useTranslations } from "@/lib/language-context";
import { Plus } from "lucide-react";

interface OrderItem {
  productId: string;
  qty: number;
  totalCost: number;
  productInput?: string;
}

interface PurchaseOrderItemsProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onAddProduct: () => void;
  onShowNewProduct: (idx: number, name: string) => void;
}

export function PurchaseOrderItems({
  items,
  onItemsChange,
  onAddProduct,
  onShowNewProduct,
}: PurchaseOrderItemsProps) {
  const { data: products = [], isLoading, error } = useGetProducts();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = useTranslations("purchases");
  const common = useTranslations("common");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideAnyDropdown = dropdownRefs.current.some(
        (ref) => ref && ref.contains(target)
      );
      const isInsideAnyInput = inputRefs.current.some(
        (ref) => ref && ref.contains(target)
      );
      
      if (!isInsideAnyDropdown && !isInsideAnyInput) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateItem = (idx: number, field: string, value: any) => {
    onItemsChange(
      items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (idx: number) => {
    onItemsChange(items.filter((_, i) => i !== idx));
  };

  const handleProductSelect = (idx: number, product: Product) => {
    onItemsChange(
      items.map((item, i) =>
        i === idx
          ? {
              ...item,
              productId: product.id,
              productInput: product.name,
              qty: item.qty || 1,
              totalCost: item.totalCost || product.priceCost || 0,
            }
          : item
      )
    );
    setActiveDropdown(null);
  };

  const handleInputChange = (idx: number, value: string) => {
    const exactMatch = products.find(p => p.name.toLowerCase() === value.toLowerCase());
    
    onItemsChange(
      items.map((item, i) =>
        i === idx
          ? {
              ...item,
              productInput: value,
              productId: exactMatch ? exactMatch.id : "",
            }
          : item
      )
    );
    
    // Show dropdown if there's input or on focus
    if (value.trim() || products.length > 0) {
      setActiveDropdown(idx);
    } else {
      setActiveDropdown(null);
    }
  };

  const handleInputFocus = (idx: number) => {
    // Always show dropdown on focus to make it more discoverable
    setActiveDropdown(idx);
  };

  const handleInputKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setActiveDropdown(null);
      inputRefs.current[idx]?.blur();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>{t("items")}</Label>
        <Button type="button" onClick={onAddProduct} variant="outline" size="sm">
          {t("addItem")}
        </Button>
      </div>

      {items.map((item, idx) => {
        const unitCost = item.qty > 0 ? item.totalCost / item.qty : 0;
        const searchTerm = item.productInput?.toLowerCase() || "";
        
        // Filter products based on search term
        const filteredProducts = searchTerm
          ? products.filter(p =>
              p.name.toLowerCase().includes(searchTerm) ||
              p.sku?.toLowerCase().includes(searchTerm)
            )
          : products.slice(0, 10); // Show first 10 products when no search
        
        // Show "Add New Product" option if:
        // 1. User has typed something that's not empty
        // 2. No exact product name match exists
        const hasInput = item.productInput && item.productInput.trim();
        const hasExactMatch = hasInput && filteredProducts.some(
          p => p.name.toLowerCase() === item.productInput!.toLowerCase()
        );
        const showAddNew = hasInput && !hasExactMatch;

        return (
          <div key={idx} className="flex gap-2 items-end relative mb-2">
            <div className="flex-1 relative">
              <Label>{common("product")} *</Label>
              <div className="relative">
                <Input
                  ref={el => {
                    inputRefs.current[idx] = el;
                  }}
                  value={item.productInput || ""}
                  onChange={e => handleInputChange(idx, e.target.value)}
                  onFocus={() => handleInputFocus(idx)}
                  onKeyDown={e => handleInputKeyDown(idx, e)}
                  placeholder={t("searchOrAddProduct")}
                  autoComplete="off"
                  className={`${item.productId ? "border-green-500" : ""} pr-10`}
                  required
                />
                {/* Quick add button */}
                {hasInput && !hasExactMatch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      onShowNewProduct(idx, item.productInput!);
                      setActiveDropdown(null);
                    }}
                    title={`Add "${item.productInput}" as new product`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Dropdown */}
              {activeDropdown === idx && (
                <div
                  ref={el => {
                    dropdownRefs.current[idx] = el;
                  }}
                  className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-60 overflow-auto"
                  style={{ top: "100%" }}
                >
                  {isLoading ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      {common("loading")}...
                    </div>
                  ) : error ? (
                    <div className="px-3 py-2 text-red-500 text-sm">
                      Error: {error.message}
                    </div>
                  ) : (
                    <>
                      {/* Existing products */}
                      {filteredProducts.length > 0 && (
                        <>
                          {filteredProducts.map(p => (
                            <div
                              key={p.id}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-50 ${
                                item.productId === p.id ? "bg-blue-50 border-blue-200" : ""
                              }`}
                              onClick={() => handleProductSelect(idx, p)}
                            >
                              <div className="font-medium text-sm">{p.name}</div>
                              {p.sku && (
                                <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                              )}
                              <div className="text-xs text-gray-600">
                                Cost: {p.priceCost?.toFixed(2) || "0.00"} TND
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* Add new product option */}
                      {showAddNew && (
                        <div
                          className="px-3 py-2 cursor-pointer text-blue-600 hover:bg-blue-50 border-t border-blue-200 text-sm font-medium flex items-center gap-2"
                          onClick={() => {
                            onShowNewProduct(idx, item.productInput!);
                            setActiveDropdown(null);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          {t("addNewProduct")}: <span className="font-normal">"{item.productInput}"</span>
                        </div>
                      )}
                      
                      {/* No results and no add option */}
                      {filteredProducts.length === 0 && !showAddNew && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          {item.productInput ? t("noProductsFound") : "Start typing to search products"}
                        </div>
                      )}
                      
                      {/* Help text when no input */}
                      {!item.productInput && (
                        <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                          💡 Tip: Type a product name to search or create a new one
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-20">
              <Label>{common("qty")}</Label>
              <Input
                type="number"
                min={1}
                value={item.qty}
                onChange={e => updateItem(idx, "qty", Number(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="w-24">
              <Label>{common("totalCost")}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.totalCost}
                onChange={e => updateItem(idx, "totalCost", Number(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="w-20">
              <Label>{common("unitCost")}</Label>
              <div className="h-10 px-3 py-2 border rounded bg-gray-50 text-sm">
                {unitCost.toFixed(2)}
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeItem(idx)}
              className="flex-shrink-0"
            >
              ×
            </Button>
          </div>
        );
      })}
      
      {items.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          {t("noItemsAdded")}. {t("clickAddItemToStart")}.
        </div>
      )}
    </div>
  );
} 