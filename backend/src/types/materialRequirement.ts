// MaterialRequirement type for BOM material requirements
export interface MaterialRequirement {
  productId: string;
  requiredQuantity: number;
  unit?: string;
  productName?: string;
}
