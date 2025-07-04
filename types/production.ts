import type { ProductionOrder, Product, BillOfMaterials, BomComponent } from "@prisma/client";

// Base types from Prisma
type BaseProduct = Product;
type BaseBomComponent = BomComponent & { product: BaseProduct };
type BaseBillOfMaterials = BillOfMaterials & { components: BaseBomComponent[] };

// Detailed type for Production Order including nested relations
export type ProductionOrderWithDetails = ProductionOrder & {
  product: BaseProduct; // The finished good
  bom?: BaseBillOfMaterials | null; // The BOM used, if any
};

// Type for a BOM with its components and the product details for each component
export type BillOfMaterialsWithComponents = BaseBillOfMaterials;

// You might also want a simpler type for forms if not all fields are directly editable
// or if you transform data for form handling.
export interface ProductionOrderFormData {
  id?: string; // Present when editing
  orderNumber?: string; // Usually auto-generated or display-only in edit
  productId: string;
  bomId?: string | null;
  qtyOrdered: number;
  qtyProduced?: number;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED"; // Or use Prisma's enum if available client-side
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  startDate?: string | null; // Use string for date inputs
  expectedEndDate?: string | null;
  notes?: string | null;
}
