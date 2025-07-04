import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleItemsFormProps {
  items: SaleItem[];
  onItemsChange: (items: SaleItem[]) => void;
  products: Array<{
    id: string;
    name: string;
    priceSell: number;
  }>;
}

export function SaleItemsForm({ items, onItemsChange, products }: SaleItemsFormProps) {
  const addItem = () => {
    const newItem: SaleItem = {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update related fields when product or quantity changes
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.priceSell;
        newItems[index].totalPrice = newItems[index].quantity * product.priceSell;
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    onItemsChange(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sale Items
          <Button type="button" onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <Label>Product</Label>
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Unit Price</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Total</Label>
              <Input
                type="number"
                value={item.totalPrice.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="col-span-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items added. Click "Add Item" to start.
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t">
          <div className="text-lg font-semibold">
            Total: ${totalAmount.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 