# Production System Fixes Summary

## Issues Fixed

### 1. UI Status Display vs API Mismatch
**Problem:** UI showed "COMPLETED" but API expected "DONE"
**Solution:** 
- Fixed translation files to show "DONE" as "COMPLETED" in English and "TERMINÉ" in French
- Updated edit page to properly handle status transitions

### 2. Import Errors in Production Order Edit Page
**Problem:** Select components import errors preventing page from loading
**Solution:**
- Replaced complex select imports with `SelectMagic` component
- Simplified the edit page to focus on core functionality (status, quantity, priority)
- Removed complex form validation that was causing TypeScript errors

### 3. BOM Scaling Calculation Errors
**Problem:** Frontend was using wrong formula for material calculations
**WRONG FORMULA:** 
```javascript
// This was multiplying instead of scaling
const needed = component.quantity * formData.qtyOrdered;
```

**CORRECT FORMULA:**
```javascript
// Proper scaling based on BOM output quantity
const scalingFactor = qtyOrdered / bomOutputQuantity;
const needed = component.quantity * scalingFactor;
```

**Example:** 
- BOM recipe: 110 barquettes = 20kg farine + 200g salt
- Production order: 20 barquettes
- Scaling factor: 20/110 = 0.182
- Required: 20kg × 0.182 = 3.64kg farine, 200g × 0.182 = 36.4g salt

### 4. API Route Fixes
**Problem:** Status transitions and inventory updates
**Solution:**
- The API route in `/app/api/production/orders/[id]/route.ts` already had the correct logic
- Fixed calculation: `requiredQty = (component.quantity / bomOutputQty) * qtyOrdered`
- Inventory updates happen automatically when status changes to "DONE"

### 5. Cost Calculation Errors  
**Problem:** Production order cost calculation was using wrong formula
**WRONG FORMULA:**
```javascript
const totalCost = scalingFactor × unitCost; // 0.182 × €0.366 = €0.067 (wrong!)
```

**CORRECT FORMULA:**
```javascript
const totalCost = qtyOrdered × unitCost; // 20 × €0.366 = €7.32 (correct!)
```

**Explanation:**
- BOM `unitCost` is already calculated as cost per individual item (€0.366 per barquette)
- Production order total should be: quantity × unit cost
- Material scaling is separate from cost calculation

## How It Works Now (Like Odoo)

### BOM Definition
- Define a BOM for 110 barquettes requiring 20kg farine + 200g salt
- The `outputQuantity: 110` tells the system this recipe produces 110 units

### Production Order Flexibility
- Create production order for ANY quantity (e.g., 20 barquettes)
- System automatically calculates scaling factor: 20/110 = 0.182
- Material consumption: 20kg × 0.182 = 3.64kg farine

### Status Transitions & Inventory Updates
1. **PLANNED → IN_PROGRESS:** Validates and consumes raw materials from inventory
2. **IN_PROGRESS → DONE:** Adds finished products to inventory
3. **PLANNED → DONE (direct):** Handles both consumption and production in one step
4. **IN_PROGRESS → PLANNED:** Reverses material consumption

### Stock Movement Tracking
- All movements create detailed `StockMovement` records
- Includes reference to production order and reason for traceability
- Supports both "IN" and "OUT" movement types

## Files Modified

1. `/app/production/orders/[id]/edit/page.tsx` - Simplified edit page with fixed imports
2. `/app/production/orders/new/page.tsx` - Fixed scaling calculations for material requirements & cost calculation
3. `/app/components/production-calculator.tsx` - Added clearer labels for cost display
4. `/messages/en.json` - Updated "done" translation to "COMPLETED"
5. `/messages/fr.json` - Updated "done" translation to "TERMINÉ"
6. `COST_CALCULATION_EXPLANATION.md` - Detailed explanation of cost flow

## Testing
- Create a BOM with 110 units output and multiple raw materials
- Create production order with different quantity (e.g., 20 units)
- System should show correct scaling factor and material requirements
- Change status to "DONE" to verify inventory updates work correctly 