# 📋 DomDom Project Tasks

This document tracks current tasks, priorities, and progress for the DomDom project. Tasks are organized by module/feature to provide a comprehensive view of each business function's implementation status.

## 🔄 System-Wide Tasks

### Codebase Modularization Plan - Status: 🔄 IN PROGRESS

- [x] Read rules and coding style and plan refactoring approach
- [ ] **Code Reorganization:**
  - [ ] Create shared component library for common UI elements:
    - [ ] Create `src/components/common/forms` for reusable form components
    - [ ] Create `src/components/common/tables` for reusable table components
    - [ ] Create `src/components/common/cards` for reusable card components
    - [ ] Create `src/components/common/modals` for reusable modal dialogs
  - [ ] Create shared hooks library:
    - [ ] Extract API hooks from components to `src/hooks/api`
    - [ ] Extract UI state hooks to `src/hooks/ui`
    - [ ] Extract business logic hooks to `src/hooks/domain`
  - [ ] Create utilities library:
    - [ ] Format utilities in `src/utils/format.ts`
    - [ ] Validation utilities in `src/utils/validation.ts`
    - [ ] Calculation utilities in `src/utils/calculations.ts`

- [ ] **Component Duplication Resolution:**
  - [ ] **Inventory/Stock Module Consolidation:**
    - [ ] Merge `frontend/src/components/inventory/stock-transaction-form.tsx` and `frontend/src/components/stock/stock-transaction-form.tsx` into single component
    - [ ] Create shared hook `useStockTransactions` in `src/hooks/domain/useStockTransactions.ts`
    - [ ] Standardize stock-related types in `src/types/stock.ts`
  - [ ] **Component File Naming:**
    - [ ] Convert all components to kebab-case (`ProductForm.tsx` → `product-form.tsx`)
    - [ ] Update all imports to reflect new naming convention

- [ ] **Backend Modularization:**
  - [ ] **Service Consolidation:**
    - [ ] Merge `backend/src/inventory` and `backend/src/stock` services into unified module
    - [ ] Extract shared logic to common services
    - [ ] Ensure each file stays under 100 lines (split when necessary)
  - [ ] **Entity Reorganization:**
    - [ ] Standardize entity naming conventions
    - [ ] Move all types to central location in `backend/src/types`
    - [ ] Update imports across codebase

## 📦 Stock Management Module (Formerly Inventory)

### Stock Module Implementation - Status: 🔄 IN PROGRESS

- [ ] **Core Components Refactoring:**
  - [ ] Create unified `StockItem` component with shared logic:
    - [ ] Path: `frontend/src/components/stock/stock-item.tsx`
    - [ ] Extract business logic to `useStockItem` hook
  - [ ] Create modular transaction recording system:
    - [ ] Path: `frontend/src/components/stock/transactions/transaction-form.tsx`
    - [ ] Path: `frontend/src/components/stock/transactions/transaction-list.tsx`
    - [ ] Path: `frontend/src/hooks/domain/useStockTransactions.ts`
  - [ ] Implement stock dashboard component:
    - [ ] Path: `frontend/src/components/stock/dashboard/stock-dashboard.tsx`
    - [ ] Extract metrics calculations to `useStockMetrics` hook
    - [ ] Create small, focused metric cards (under 100 lines each)

- [ ] **Stock Tracking Features:**
  - [ ] Implement low stock alerts component:
    - [ ] Path: `frontend/src/components/stock/alerts/low-stock-alerts.tsx`
    - [ ] Extract alert logic to `useLowStockAlerts` hook
  - [ ] Create stock valuation reporting:
    - [ ] Path: `frontend/src/components/stock/reports/stock-valuation.tsx`
    - [ ] Extract calculation logic to utility functions

- [ ] **Stock Count Workflow:**
  - [ ] Refactor existing stock count components:
    - [ ] Split `frontend/src/components/stock/stock-count.tsx` into smaller components
    - [ ] Create dedicated hook for stock count logic
  - [ ] Implement reconciliation process:
    - [ ] Create reconciliation component and supporting hook

## 🏭 Production Management Module

### Production Enhancement Features - Status: 🔄 IN PROGRESS

- [ ] **Production Dashboard Improvements:**
  - [ ] Create modular production metrics cards:
    - [ ] Path: `frontend/src/components/production/dashboard/metrics`
    - [ ] Create separate components for each metric (under 100 lines)
  - [ ] Implement production efficiency tracking:
    - [ ] Create components for visualizing efficiency data
    - [ ] Extract calculation logic to dedicated hooks

- [ ] **Production Report System:**
  - [ ] Create PDF export functionality:
    - [ ] Path: `frontend/src/services/reports/production-report-service.ts`
    - [ ] Path: `frontend/src/components/production/reports/production-report.tsx`
  - [ ] Implement advanced filtering options:
    - [ ] Extract filter logic to custom hook
    - [ ] Create reusable filter components

## 📑 Bill of Materials (BOM) Module

### BOM Enhancement Features - Status: 🔄 PLANNED

- [ ] **BOM Management Improvements:**
  - [ ] Refactor BOM components into smaller, focused components:
    - [ ] Path: `frontend/src/components/bom/editor/bom-editor.tsx`
    - [ ] Path: `frontend/src/components/bom/editor/bom-item-form.tsx`
    - [ ] Path: `frontend/src/components/bom/viewer/bom-details.tsx`
  - [ ] Extract business logic to custom hooks:
    - [ ] Path: `frontend/src/hooks/domain/useBomManagement.ts`
    - [ ] Path: `frontend/src/hooks/domain/useBomCalculations.ts`

- [ ] **Cost Calculation System:**
  - [ ] Implement advanced cost calculation components:
    - [ ] Material cost component
    - [ ] Labor cost component
    - [ ] Packaging cost component
    - [ ] Overhead allocation component
  - [ ] Create unified cost breakdown view:
    - [ ] Path: `frontend/src/components/bom/costs/cost-breakdown.tsx`
    - [ ] Extract calculation logic to utility functions

## 👨‍💼 Employee Management Module

### Employee Enhancement Features - Status: 🔄 PLANNED

- [ ] **Employee Profile System:**
  - [ ] Refactor employee components into smaller, focused components:
    - [ ] Path: `frontend/src/components/employee/profile/employee-profile.tsx`
    - [ ] Path: `frontend/src/components/employee/profile/employee-edit-form.tsx`
    - [ ] Extract shared logic to hooks:
      - [ ] Path: `frontend/src/hooks/domain/useEmployeeProfile.ts`

- [ ] **Attendance Tracking System:**
  - [ ] Create modular attendance components:
    - [ ] Path: `frontend/src/components/employee/attendance/attendance-record.tsx`
    - [ ] Path: `frontend/src/components/employee/attendance/attendance-report.tsx`
    - [ ] Path: `frontend/src/components/employee/attendance/attendance-summary.tsx`
  - [ ] Extract business logic to dedicated hooks:
    - [ ] Path: `frontend/src/hooks/domain/useAttendanceTracking.ts`
    - [ ] Path: `frontend/src/hooks/domain/useAttendanceReporting.ts`

- [ ] **Performance Management System:**
  - [ ] Create performance tracking components:
    - [ ] Path: `frontend/src/components/employee/performance/performance-metrics.tsx`
    - [ ] Path: `frontend/src/components/employee/performance/productivity-chart.tsx`
  - [ ] Create KPI dashboard:
    - [ ] Path: `frontend/src/components/employee/dashboard/employee-dashboard.tsx`
    - [ ] Each metric card should be under 100 lines

- [ ] **Salary and Bonus Management:**
  - [ ] Implement salary configuration components:
    - [ ] Path: `frontend/src/components/employee/salary/salary-config.tsx`
    - [ ] Path: `frontend/src/components/employee/salary/role-salary-matrix.tsx`
  - [ ] Create bonus calculation system:
    - [ ] Path: `frontend/src/components/employee/bonus/bonus-calculator.tsx`
    - [ ] Path: `frontend/src/hooks/domain/useBonusCalculation.ts`
  - [ ] Implement payroll reporting:
    - [ ] Path: `frontend/src/components/employee/reports/payroll-report.tsx`
    - [ ] Path: `frontend/src/services/reports/payroll-report-service.ts`

## 💰 Sales Management Module

### Sales Enhancement Features - Status: 🔄 PLANNED

- [ ] **Core Sales System Refactoring:**
  - [ ] Create modular sales components:
    - [ ] Path: `frontend/src/components/sales/core/sales-form.tsx`
    - [ ] Path: `frontend/src/components/sales/core/sales-list.tsx`
    - [ ] Path: `frontend/src/components/sales/core/sales-details.tsx`
  - [ ] Extract business logic to dedicated hooks:
    - [ ] Path: `frontend/src/hooks/domain/useSalesManagement.ts`
    - [ ] Path: `frontend/src/hooks/domain/useSalesReporting.ts`

- [ ] **Door-to-Door Sales System:**
  - [ ] Create mobile-optimized sales interface:
    - [ ] Path: `frontend/src/components/sales/mobile/mobile-sales-form.tsx`
    - [ ] Path: `frontend/src/components/sales/mobile/daily-reconciliation.tsx`
  - [ ] Implement offline capabilities:
    - [ ] Path: `frontend/src/hooks/api/useOfflineSalesSync.ts`
    - [ ] Path: `frontend/src/services/offline-storage-service.ts`
  - [ ] Create sales team dashboard:
    - [ ] Path: `frontend/src/components/sales/dashboard/sales-team-dashboard.tsx`
    - [ ] Path: `frontend/src/components/sales/dashboard/salesperson-performance.tsx`

- [ ] **Business Client Order System:**
  - [ ] Implement business client order components:
    - [ ] Path: `frontend/src/components/sales/business/business-order-form.tsx`
    - [ ] Path: `frontend/src/components/sales/business/recurring-order-config.tsx`
  - [ ] Create customer management interface:
    - [ ] Path: `frontend/src/components/sales/customers/customer-list.tsx`
    - [ ] Path: `frontend/src/components/sales/customers/customer-details.tsx`
  - [ ] Implement invoicing system:
    - [ ] Path: `frontend/src/components/sales/invoicing/invoice-generator.tsx`
    - [ ] Path: `frontend/src/components/sales/invoicing/invoice-list.tsx`
    - [ ] Path: `frontend/src/components/sales/invoicing/invoice-details.tsx`
    - [ ] Path: `frontend/src/services/reports/invoice-service.ts`

- [ ] **Sales Reporting System:**
  - [ ] Create advanced sales report components:
    - [ ] Path: `frontend/src/components/sales/reports/sales-summary-report.tsx`
    - [ ] Path: `frontend/src/components/sales/reports/product-sales-report.tsx`
  - [ ] Implement export functionality:
    - [ ] Path: `frontend/src/services/reports/sales-report-service.ts`
    - [ ] Support PDF and Excel exports

## 🛒 Purchase Management Module

### Purchase Management Features - Status: 🔄 PLANNED

- [ ] **Purchase Core System:**
  - [ ] Create modular backend services:
    - [ ] Path: `backend/src/purchase/services/purchase-order.service.ts`
    - [ ] Path: `backend/src/purchase/services/supplier.service.ts`
    - [ ] Path: `backend/src/purchase/controllers/purchase-order.controller.ts`
    - [ ] Path: `backend/src/purchase/controllers/supplier.controller.ts`
  - [ ] Implement purchase DTOs and entities:
    - [ ] Path: `backend/src/purchase/dto/create-purchase-order.dto.ts`
    - [ ] Path: `backend/src/purchase/dto/update-purchase-order.dto.ts`
    - [ ] Path: `backend/src/purchase/entities/purchase-order.entity.ts`
    - [ ] Path: `backend/src/purchase/entities/purchase-order-item.entity.ts`
    - [ ] Path: `backend/src/purchase/entities/supplier.entity.ts`
  
- [ ] **Supplier Management System:**
  - [ ] Create frontend supplier components:
    - [ ] Path: `frontend/src/components/purchase/suppliers/supplier-list.tsx`
    - [ ] Path: `frontend/src/components/purchase/suppliers/supplier-form.tsx`
    - [ ] Path: `frontend/src/components/purchase/suppliers/supplier-details.tsx`
  - [ ] Extract business logic to hooks:
    - [ ] Path: `frontend/src/hooks/domain/useSupplierManagement.ts`

- [ ] **Purchase Order System:**
  - [ ] Create frontend purchase order components:
    - [ ] Path: `frontend/src/components/purchase/orders/purchase-order-list.tsx`
    - [ ] Path: `frontend/src/components/purchase/orders/purchase-order-form.tsx`
    - [ ] Path: `frontend/src/components/purchase/orders/purchase-order-details.tsx`
  - [ ] Implement purchase item components:
    - [ ] Path: `frontend/src/components/purchase/items/purchase-item-form.tsx`
    - [ ] Path: `frontend/src/components/purchase/items/purchase-item-list.tsx`
  - [ ] Create order workflow:
    - [ ] Path: `frontend/src/components/purchase/workflow/purchase-approval.tsx`
    - [ ] Path: `frontend/src/components/purchase/workflow/purchase-receipt.tsx`
  - [ ] Extract business logic to hooks:
    - [ ] Path: `frontend/src/hooks/domain/usePurchaseOrder.ts`
    - [ ] Path: `frontend/src/hooks/domain/usePurchaseWorkflow.ts`
  - [ ] Create purchase order creation and tracking endpoints
  - [ ] Implement purchase receipt functionality with stock updates
  - [ ] Add automatic cost calculation for raw materials
  - [ ] Create purchase reporting and analytics endpoints
  - [ ] Build integration with Stock module for inventory updates
  - [ ] Write unit and integration tests for purchase endpoints

- [ ] **Purchase Module Development (Frontend)**

  - [ ] Create Purchase dashboard with key metrics
  - [ ] Implement supplier management interface
  - [ ] Develop purchase order creation and management screens
  - [ ] Build purchase order receipt processing workflow
  - [ ] Create purchase reports and analytics views
  - [ ] Implement automatic cost calculation display
  - [ ] Add purchase history tracking for raw materials
  - [ ] Develop custom hooks for purchase data management
  - [ ] Design responsive layouts for all purchase-related views
  - [ ] Create specialized forms for different purchase workflows

- [ ] **Integration and Testing**

  - [ ] Connect purchase module to stock module for inventory updates
  - [ ] Test complete purchase workflow (create order, receive items, update stock)
  - [ ] Validate cost calculation functionality
  - [ ] Test supplier management features
  - [ ] Verify purchase reporting accuracy
  - [ ] Create end-to-end tests for critical purchase operations

- [ ] **Documentation Updates**
  - [ ] Update PROJECT_OVERVIEW.md to include Purchase module
  - [ ] Create technical documentation for Purchase API endpoints
  - [ ] Document purchase workflows and integration points
  - [ ] Create data model diagrams for purchase entities
  - [ ] Add user guides for purchase module functionality

## 📄 Document Generation Module

### Document Generation - Status: 🔄 PLANNED

- [ ] Implement document generation system
  - [ ] Create document template database models
  - [ ] Implement document generation API services
  - [ ] Create document template management interface
  - [ ] Implement document generation UI
  - [ ] Add document preview functionality
  - [ ] Create document export options (PDF/Excel)
  - [ ] Implement "bon de sortie" generation for delivery vans

## 💸 Financial Management Module

### Financial Management - Status: 🔄 PLANNED

- [ ] Implement expense tracking system
  - [ ] Create expense database models and types
  - [ ] Implement expense tracking API services
  - [ ] Create monthly bill tracking for fixed expenses
  - [ ] Track variable expenses (fuel, supplies)
  - [ ] Implement expense categorization and reporting
  - [ ] Create expense dashboard with period comparison
- [ ] Implement financial reporting system
  - [ ] Create period-based revenue tracking
  - [ ] Develop net profit calculation based on time periods
  - [ ] Generate profit margin analysis by product
  - [ ] Implement sales channel profitability comparison
  - [ ] Create financial performance dashboard
  - [ ] Add export options for all financial reports

## 🚐 Vehicle Management Module

### Vehicle Management - Status: 🔄 PLANNED

- [ ] Implement delivery van fleet management
  - [ ] Create vehicle database models and types
  - [ ] Implement vehicle management API services
  - [ ] Create vehicle profiles for the 2 delivery vans
  - [ ] Track mileage and fuel consumption
  - [ ] Schedule preventive maintenance based on mileage/time
  - [ ] Set up notifications for upcoming maintenance
  - [ ] Manage maintenance records and history
  - [ ] Track maintenance costs per vehicle

## 📊 Reporting & Analytics Module

### Core Reporting - Status: ✅ PARTIALLY COMPLETED

- ✅ Implement basic reporting
  - ✅ Create basic dashboard with key metrics
  - ✅ Implement simple inventory reports
  - ✅ Add basic sales reporting

### Reporting Enhancements - Status: 🔄 PLANNED

- [ ] Implement comprehensive reporting system
  - [ ] Create business intelligence dashboards
  - [ ] Implement cost trend analysis with visualizations
  - [ ] Generate product profitability comparison tools
  - [ ] Create cash flow forecasting based on orders and expenses
  - [ ] Implement report scheduling and automation

## 🐛 Bugs to Fix

- [ ] Correct error in production record counting
- [ ] Fix date formatting issues in production order details
- [ ] Address performance issues when loading large number of orders

## 📈 Future Enhancements

- [ ] Add drag-and-drop functionality to production scheduling
- [ ] Implement barcode scanning for inventory tracking
- [ ] Create mobile-responsive views for shop floor access
- [ ] Add real-time notifications for production events
