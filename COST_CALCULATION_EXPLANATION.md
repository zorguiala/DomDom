# Cost Calculation in BOM & Production System

## Understanding the Cost Flow

### 1. BOM Creation (Recipe Definition)
When you create a BOM for **110 barquettes**, here's what happens:

**Example BOM:**
- Output: 110 barquettes
- Components: 20kg farine (€2/kg) + 200g salt (€1/kg)

**Calculations:**
```
Component Costs:
- Farine: 20kg × €2/kg = €40
- Salt: 0.2kg × €1/kg = €0.2
- Total Cost: €40.2

Unit Cost = Total Cost ÷ Output Quantity
Unit Cost = €40.2 ÷ 110 = €0.366 per barquette
```

### 2. What Gets Stored
- **BOM.unitCost**: €0.366 (cost per individual barquette)
- **Product.priceCost**: €0.366 (updated automatically for the finished product)

### 3. Production Order (Any Quantity)
When you create a production order for **20 barquettes**:

**Correct Calculations:**
```
Material Requirements (Scaling):
- Scaling Factor: 20 ÷ 110 = 0.182
- Farine needed: 20kg × 0.182 = 3.64kg
- Salt needed: 0.2kg × 0.182 = 0.036kg

Total Production Cost:
- Cost = Quantity × Unit Cost
- Cost = 20 × €0.366 = €7.32
```

### 4. Inventory Impact
When production order is marked as "COMPLETED":

**Raw Materials (Consumed):**
- Farine: -3.64kg from inventory
- Salt: -0.036kg from inventory

**Finished Products (Added):**
- Barquettes: +20 units to inventory
- Each unit valued at €0.366

## Key Concepts

### ✅ Unit Cost is Per Individual Item
- The BOM's `unitCost` (€0.366) represents the cost per 1 barquette
- This is the **correct** cost per unit based on the recipe scaling

### ✅ Production Order Total Cost
- For any quantity: `Total Cost = Quantity × Unit Cost`
- For 20 barquettes: `€7.32 = 20 × €0.366`
- For 55 barquettes: `€20.13 = 55 × €0.366`

### ✅ Material Scaling
- Materials are scaled proportionally: `Required = (Component Qty ÷ BOM Output) × Production Qty`
- This allows flexible production quantities while maintaining correct material consumption

## Before vs After Fix

### ❌ Before (Wrong)
```javascript
// WRONG: Used scaling factor on unit cost
const totalCost = scalingFactor × unitCost;
// Example: 0.182 × €0.366 = €0.067 (nonsense!)
```

### ✅ After (Correct)
```javascript
// CORRECT: Quantity times unit cost
const totalCost = qtyOrdered × unitCost;
// Example: 20 × €0.366 = €7.32 (makes sense!)
```

## UI Improvements Made

1. **BOM Calculator:** Added "(per item)" label to unit cost and "For X units" to total cost
2. **Production Order:** Fixed cost calculation to use quantity × unit cost
3. **Clear Labels:** Made it obvious what each cost represents

This now works exactly like Odoo's manufacturing cost calculations! 🎉 