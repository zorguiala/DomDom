# 📋 DomDom Project Tasks

This document tracks current tasks, priorities, and progress for the DomDom project.

## 🔄 Currently In Progress

### Important - Codebase Refactoring

- [x] Read rules and coding style and plan refactoring approach
- [ ] Frontend Component Refactoring:
  - [ ] Resolve component duplication:
    - [ ] Audit duplicate components in src/components and feature folders (Sidebar, Layout, NavBar)
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

## 📅 Upcoming Tasks

### Sales Management Frontend Implementation

- [ ] Create sales types in `types/sales.ts`
- [ ] Implement sales API service
- [ ] Create SalesOrderList component
- [ ] Implement direct sales recording interface
- [ ] Implement commercial sales recording interface
- [ ] Create invoice generation UI
- [ ] Add sales dashboard widgets

### Employee Management Frontend Implementation

- [ ] Create employee management interface
- [ ] Implement attendance tracking UI
- [ ] Create employee productivity metrics view
- [ ] Implement employee scheduling features

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
