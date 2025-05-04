# 📋 DomDom Project Tasks

This document tracks current tasks, priorities, and progress for the DomDom project.

## 🔄 Currently In Progress

### Important - Codebase Refactoring

- [x] Read rules and coding style and plan refactoring approach
- [ ] Frontend Component Refactoring:
  - [ ] Resolve component duplication:
    - [ ] Compare implementations and determine which to keep
    - [ ] Consolidate to a single implementation in the appropriate location
    - [ ] Update all imports to reference the correct component files
  - [ ] Fix file naming conventions:
    - [ ] Create a script to rename frontend component files from PascalCase to kebab-case
    - [ ] Update all import statements across the project accordingly
    - [ ] Test that the application builds successfully after renaming
  - [ ] Reorganize file structure:
    - [ ] Move layout components to components/layout directory
    - [ ] Ensure all feature-specific components are in appropriate feature folders
    - [ ] Group related components by functionality
    - [ ] Update imports after reorganization
  - [ ] Enhance component structure:
    - [ ] Extract business logic from UI components into custom hooks
    - [ ] Update components to use the extracted hooks
    - [ ] Add proper type definitions and prop validations
    - [ ] Ensure components follow the functional component pattern
- [ ] Backend Code Refactoring:
  - [ ] Review and refactor files exceeding 500 lines
  - [ ] Ensure consistent module structure across features
  - [ ] Verify proper separation of concerns (thin controllers, business logic in services)

### Production Management Frontend Implementation

- ✅ Create production types in `types/production.ts`
- ✅ Implement production API service in `services/productionServices/productionApi.ts`
- ✅ Implement useRecordProduction hook in `services/productionServices/use-record-production`
- ✅ Update Production page with tabbed interface for different views
- ✅ Create ProductionOrderList component
- ✅ Create ProductionOrderForm component for creating/editing orders
- ✅ Create ProductionOrderDetails component for viewing order details
- ✅ Create RecordProductionForm for recording production outputs
- ✅ Refactor production components to use hooks and strict types (see `frontend/src/components/production/` and `frontend/src/hooks/`)
- ✅ Fix Ant Design Tabs deprecation and filter errors (see `frontend/src/pages/production.tsx`)
- ✅ Ensure all production types are in `frontend/src/types/production.ts`
- [ ] Add search and filtering functionality for production orders:
  - [ ] Implement search by order number/name/product
  - [ ] Add date range filtering
  - [ ] Add status filtering (pending, in progress, completed)
- [ ] Add production statistics and metrics to the dashboard:
  - [ ] Create production overview component
  - [ ] Implement daily/weekly/monthly production charts
  - [ ] Add efficiency metrics display
- [ ] Create production reports view:
  - [ ] Design production summary report
  - [ ] Implement date range selection for reports
  - [ ] Add export to PDF/Excel functionality

### BOM Management Improvements

- [ ] Enhance BOM component UI/UX
- [ ] Add material requirements calculation view
- [ ] Add cost calculation view
- [ ] Implement BOM versioning support
- [ ] Create BOM comparison feature

### Purchase Management Implementation

- [ ] Implement purchase order tracking (achats) from suppliers (fournisseurs)
- [ ] Create supplier management UI and backend
- [ ] Add purchase reporting and analytics

### Employee Salary & Bonus Management

- [ ] Implement comprehensive employee management system:
  - [ ] Create employee profiles with roles and skill sets
  - [ ] Track employee task assignments to different products each day
  - [ ] Implement flexible employee scheduling system
- [ ] Design salary management system:
  - [ ] Create base salary configuration for different roles
  - [ ] Implement timesheet tracking and validation
  - [ ] Support salary adjustments and history tracking
- [ ] Develop performance-based bonus system:
  - [ ] Define performance metrics and KPIs for different roles
  - [ ] Create automated bonus calculation based on productivity data
  - [ ] Support management override for special bonuses
  - [ ] Implement bonus history and tracking
- [ ] Create salary and bonus reporting:
  - [ ] Generate monthly payroll reports
  - [ ] Create performance trends analysis
  - [ ] Implement year-to-date compensation reports
  - [ ] Create cost allocation reports for employee costs across products

### Sales Management Enhancements

- [ ] Implement door-to-door sales workflow with salespeople:
  - [ ] Create mobile-friendly interface for door-to-door salespeople
  - [ ] Implement end-of-day sales reconciliation for tracking what they sold
  - [ ] Add offline mode capabilities for salespeople working in areas with poor connectivity
  - [ ] Create sales team dashboard with team performance metrics
- [ ] Add support for direct company/business orders:
  - [ ] Create specialized order form for business clients
  - [ ] Implement recurring order functionality
  - [ ] Add business customer management
  - [ ] Create business customer invoicing with payment tracking

### Inventory & Stock Enhancements

- [ ] Implement advanced inventory management:
  - [ ] Create intelligent low stock alert system based on historical daily usage
  - [ ] Implement predictive stock forecasting based on production schedules
  - [ ] Add batch tracking for raw materials
  - [ ] Create inventory valuation reports
  - [ ] Implement inventory count and reconciliation workflows
  - [ ] Track inventory wastage and spoilage for food products

### BOM & Costing Enhancements

- [ ] Improve Bill of Materials management:
  - [ ] Create comprehensive BOM structure with raw materials and packaging (emballage)
  - [ ] Support variant BOMs for different product sizes/configurations
  - [ ] Implement BOM version control and history
- [ ] Develop advanced product costing system:
  - [ ] Calculate material costs based on current inventory valuation
  - [ ] Include packaging/emballage costs in product calculations
  - [ ] Create flexible employee cost allocation options:
    - [ ] Support manual allocation for employees working on multiple products
    - [ ] Implement time-tracking based allocation (optional)
    - [ ] Allow for excluding employee costs from product costing
  - [ ] Track overhead and fixed cost allocation
  - [ ] Calculate final unit costs with configurable components
- [ ] Create BOM analytics:
  - [ ] Material usage efficiency reporting
  - [ ] Cost breakdown analysis
  - [ ] Cost trend tracking over time

### Bills & Maintenance Tracking

- [ ] Implement expense tracking system:
  - [ ] Create monthly bill tracking for fixed expenses (electricity, loans, rent)
  - [ ] Track variable expenses (gas for vans, general supplies)
  - [ ] Implement expense categorization and reporting
  - [ ] Create expense dashboard with period comparison
- [ ] Implement delivery van fleet management:
  - [ ] Create vehicle profiles for each of the 2 delivery vans
  - [ ] Track mileage and fuel consumption
  - [ ] Schedule preventive maintenance based on mileage/time
  - [ ] Set up notifications for upcoming maintenance
  - [ ] Manage maintenance records and history
  - [ ] Track maintenance costs per vehicle

### Reporting & Analytics

- [ ] Implement comprehensive financial reporting system:
  - [ ] Create period-based revenue tracking (daily, weekly, monthly, yearly)
  - [ ] Implement expense categorization and reporting
  - [ ] Develop net profit calculation based on configurable time periods
  - [ ] Create profit margin analysis by product and product category
  - [ ] Implement sales channel profitability comparison (direct vs. door-to-door)
- [ ] Create business intelligence dashboards:
  - [ ] Financial performance overview with KPIs
  - [ ] Cost trend analysis with graphical visualization
  - [ ] Product profitability comparison tools
  - [ ] Cash flow forecasting based on orders and expenses
- [ ] Implement export options for all reports (PDF, Excel, CSV)
- [ ] Create automated reporting and scheduling features for key reports

## 📅 Upcoming Tasks

### Sales Management Frontend Implementation

- ✅ Create sales types in `types/sales.ts` (see `frontend/src/types/sales.ts`)
- ✅ Implement sales API service (see `frontend/src/services/sales-service.ts`)
- ✅ Create SalesOrderList component (see `frontend/src/components/sales/sales-list.tsx`)
- ✅ Implement direct sales recording interface (see `frontend/src/components/sales/sales-form.tsx`)
- ✅ Implement commercial sales recording interface (see `frontend/src/components/sales/sales-form.tsx`)
- ✅ Implement full CRUD for sales (see `frontend/src/components/sales/` and `frontend/src/hooks/use-sales.ts`)
- [ ] Create invoice generation UI
- [ ] Add sales dashboard widgets

### Sales Management Backend Implementation

- ✅ Create sales types in `src/types/sale.types.ts`
- ✅ Implement sales API service (see `backend/src/sales/sales.service.ts`)
- ✅ Implement CRUD endpoints for sales (see `backend/src/sales/sales.controller.ts`)
- ✅ Implement direct and commercial sales logic (see `backend/src/sales/sales.service.ts`)
- ✅ Add sales reporting endpoint (see `backend/src/sales/sales.controller.ts`)
- [ ] Create invoice generation logic
- [ ] Add sales analytics endpoints/widgets

### Employee Management Frontend Implementation

- [x] Create employee management interface (employee-management.tsx, employee-management page, i18n keys)
- [x] Implement attendance tracking UI (tabbed view, attendance table, i18n)
- [x] Create employee productivity metrics view (tabbed view, productivity table, i18n)
- [x] Implement employee scheduling features (tabbed view, scheduling table, i18n)

### Document Generation Frontend Implementation

- [ ] Create document template management interface
- [ ] Implement document generation UI
- [ ] Create document preview functionality
- [ ] Add document export options (PDF/Excel)

## ✅ Completed Tasks

### Core System Setup

- ✅ Initialize NestJS backend
- ✅ Initialize React frontend with Vite
- ✅ Set up database models and migrations
- ✅ Implement authentication system
- ✅ Create main navigation and layout

### Inventory Management

- ✅ Create inventory types
- ✅ Implement inventory API service
- ✅ Create product management interface
- ✅ Implement inventory transactions recording
- ✅ Add low stock alerts

### BOM Management

- ✅ Create BOM types
- ✅ Implement BOM API service
- ✅ Create basic BOM management interface

## 🔍 Discovered During Work

- [ ] Need to implement batch production tracking
- [ ] Consider adding quality control checkpoints to production process
- [ ] Improve error handling in production recording form
- [ ] Add notifications for completed production orders

## 🐛 Bugs to Fix

- [ ] Correct error in production record counting
- [ ] Fix date formatting issues in production order details
- [ ] Address performance issues when loading large number of orders

## 📈 Future Enhancements

- [ ] Add drag-and-drop functionality to production scheduling
- [ ] Implement barcode scanning for inventory tracking
- [ ] Create mobile-responsive views for shop floor access
- [ ] Add real-time notifications for production events
