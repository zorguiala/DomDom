export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  items: SaleItem[];
}

export interface CreateSaleDto {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SaleReportItem {
  date: string;
  customerName: string;
  productName: string;
  quantity: number;
  total: number;
}

export interface SaleReport {
  items: SaleReportItem[];
  totalSales: number;
  totalRevenue: number;
}
