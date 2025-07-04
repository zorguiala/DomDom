import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix";

interface CustomerInfo {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerId?: string;
  notes?: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  customers?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;
  isRequired?: boolean;
}

export function CustomerInfoForm({ 
  customerInfo, 
  onCustomerInfoChange, 
  customers = [],
  isRequired = false 
}: CustomerInfoFormProps) {
  
  const handleFieldChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value,
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      onCustomerInfoChange({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email || '',
        customerPhone: selectedCustomer.phone || '',
        customerAddress: selectedCustomer.address || '',
        notes: customerInfo.notes || '',
      });
    } else {
      // Clear customer info if no customer selected
      onCustomerInfoChange({
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        notes: customerInfo.notes || '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customers.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="existing-customer">Select Existing Customer</Label>
            <Select onValueChange={handleCustomerSelect} value={customerInfo.customerId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer or enter new details below" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">New Customer</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.email && `(${customer.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">
              Customer Name {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="customer-name"
              value={customerInfo.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              placeholder="Enter customer name"
              required={isRequired}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerInfo.customerEmail || ''}
              onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input
              id="customer-phone"
              value={customerInfo.customerPhone || ''}
              onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customer-address">Address</Label>
            <Textarea
              id="customer-address"
              value={customerInfo.customerAddress || ''}
              onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
              placeholder="Customer address"
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea
              id="customer-notes"
              value={customerInfo.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Additional notes about this customer or sale"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 