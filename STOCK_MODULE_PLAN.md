# Stock Module Refactoring Technical Plan

## Overview

This document outlines the technical approach for refactoring the current Inventory module into a more streamlined Stock module. The refactoring will simplify the data model while retaining essential functionality and adding new financial metrics.

## Backend Changes

### Entity Refactoring

1. **Product Entity**

   - Retain existing structure but simplify fields
   - Add profitability metrics calculation fields
   - Ensure cost tracking fields are properly implemented

2. **StockTransaction Entity** (renamed from InventoryTransaction)

   - Simplify transaction types to: PURCHASE, PRODUCTION_IN, PRODUCTION_OUT, SALE, ADJUSTMENT
   - Add reference field for linking to related entities (sales, production orders)
   - Improve reporting capabilities

3. **StockCount Entity** (renamed from InventoryCount)
   - Simplify the count workflow
   - Streamline reconciliation process
   - Retain audit trail capability

### Service Layer Changes

1. **StockService** (core service)

   - Implement stock tracking for both raw materials and finished products
   - Create methods for calculating stock valuation
   - Add methods for identifying most profitable items
   - Develop functionality for tracking top-selling items
   - Optimize low stock detection

2. **StockTransactionService**

   - Simplify transaction recording workflow
   - Create aggregation methods for reporting
   - Implement stock movement analysis

3. **StockCountService**

   - Streamline inventory verification process
   - Implement improved reconciliation workflow

4. **BomService** (integrated)
   - Move BOM functionality into Stock module
   - Ensure BOM creation works within Stock context
   - Implement cost calculation based on current raw material costs

### Controller Layer Changes

1. **StockController**

   - Create endpoints for basic stock CRUD operations
   - Add endpoints for stock metrics (value, profitability, sales)
   - Implement endpoints for low stock alerts

2. **StockTransactionController**

   - Simplify transaction endpoints
   - Add bulk transaction capability

3. **StockCountController**
   - Streamline count process endpoints
   - Simplify reconciliation endpoints

### Database Migrations

1. Create migration script for:
   - Renaming inventory tables to stock tables
   - Adding new fields for metrics
   - Updating foreign key relationships
   - Preserving existing data

## Frontend Changes

### Component Refactoring

1. **Stock Dashboard**

   - Create unified dashboard with key metrics:
     - Total stock value
     - Low stock alerts
     - Most profitable items
     - Top selling items
   - Implement metrics widgets with drill-down capability

2. **StockList Component**

   - Implement filterable, sortable list of all stock items
   - Add quick access to stock transactions
   - Include visual indicators for stock status (low stock in red)
   - Add profitability indicators

3. **StockTransactionForm**

   - Create simplified form for recording stock movements
   - Support different transaction types in a unified interface
   - Implement batch transaction capabilities

4. **StockValuationReport**

   - Create financial view of inventory
   - Implement historical valuation tracking
   - Add export functionality

5. **StockCount Workflow**

   - Simplify count creation, execution, and reconciliation
   - Improve user interface for count process
   - Add validation and error prevention

6. **BomManagement** (integrated)
   - Create BOM management within Stock module
   - Implement BOM creation and editing
   - Add cost calculation based on current raw material costs

### Custom Hooks

1. **useStock** - Core stock data fetching and state management
2. **useStockMetrics** - Calculations for stock metrics
3. **useStockTransactions** - Managing stock movement operations
4. **useStockCount** - Managing inventory count workflow
5. **useBom** - BOM creation and management operations

### Routing and Navigation

1. Update main navigation to replace "Inventory" with "Stock"
2. Create routes for new stock components
3. Create sub-navigation within Stock module for:
   - Stock Overview
   - Stock Items
   - BOM Management
   - Stock Counts

## Integration with Purchase Module

The Stock module will integrate with the separate Purchase module through:

1. **Transaction API**

   - Stock module will provide endpoints for receiving purchase transactions
   - Purchase receipts will trigger stock transactions of type "PURCHASE"

2. **Cost Updates**

   - Purchase module will update product costs based on latest purchase prices
   - Stock module will use these costs for valuation calculations

3. **Low Stock Monitoring**
   - Stock module will provide low stock data to Purchase module
   - Purchase module can use this data for purchase order suggestions

## Testing Strategy

1. **Unit Tests**

   - Test StockService core functions
   - Validate stock calculations and metrics
   - Test transaction recording accuracy
   - Verify BOM cost calculations

2. **Integration Tests**

   - Verify proper database interactions
   - Test complete workflows (stock creation, transactions, counts)
   - Test integration points with the Purchase module
   - Validate API responses

3. **UI Tests**
   - Test component rendering and functionality
   - Verify user workflows function correctly
   - Test responsiveness

## Migration Strategy

1. **Database Migration**

   - Create and test migration scripts
   - Plan for data preservation
   - Include rollback capability

2. **Phased Implementation**
   - Implement backend changes first
   - Create new frontend components alongside existing ones
   - Switch routing to new components when ready
   - Monitor for issues post-migration

## Performance Considerations

1. Optimize database queries for stock listing and metrics calculations
2. Implement caching for frequently accessed stock data
3. Use virtualization for large stock lists
4. Consider batch processing for transaction imports

## Key Features

1. **Unified Stock Management**

   - Single interface for raw materials and finished products
   - Clear visibility of stock levels across all items
   - Simplified transaction recording

2. **Financial Metrics**

   - Stock value calculation directly in stock module
   - Most profitable products identified within stock view
   - Top selling products tracked in stock module

3. **Intelligent Stock Monitoring**

   - Low stock indicators (red visual indicators)
   - Alert thresholds configurable per product
   - Automatic stock adjustments when production orders complete

4. **Integrated BOM Management**
   - BOM creation within stock module
   - Automatic cost calculation based on raw material costs
   - Production planning based on BOM requirements
