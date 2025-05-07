# 📋 DomDom Project Tasks

This document tracks current tasks, priorities, and progress for the DomDom project. Tasks are organized by module/feature to provide a comprehensive view of each business function's implementation status.

## 🔄 System-Wide Tasks

### Codebase Refactoring

- [x] Read rules and coding style and plan refactoring approach
- [ ] Component Refactoring:
  - [ ] Resolve component duplication across the system
  - [ ] Fix file naming conventions (PascalCase to kebab-case)
  - [ ] Reorganize file structure by feature modules
  - [ ] Extract business logic from UI components into custom hooks
- [ ] Code Quality Improvements:
  - [ ] Review and refactor files exceeding 500 lines
  - [ ] Ensure consistent module structure across features
  - [ ] Verify proper separation of concerns (thin controllers, business logic in services)

## 📦 Inventory Management Module

### Core Inventory Management - Status: ✅ COMPLETED

- ✅ Implement basic inventory management
  - ✅ Create inventory types and database models
  - ✅ Implement inventory API services
  - ✅ Create product management interface
  - ✅ Implement inventory transactions recording
  - ✅ Add basic stock level tracking

### Inventory Enhancements - Status: 🚫 SUPERSEDED BY REFACTOR

- [x] Implement advanced inventory management:
  - [x] Create intelligent low stock alert system based on historical daily usage
  - [x] Implement predictive stock forecasting based on production schedules
  - [x] Add batch tracking for raw materials
  - [x] Create inventory valuation reports
  - [x] Implement inventory count and reconciliation workflows
  - [x] Track inventory wastage and spoilage for food products

### Inventory Module Refactor - Status: 📝 PLANNED

- [ ] **Stock Module Refactoring (Backend)**
  - [ ] Rename and refactor inventory entities to stock entities (Product, StockTransaction, StockCount)
  - [ ] Create simplified stock service for tracking raw materials and finished products
  - [ ] Update database schemas and create necessary migrations
  - [ ] Implement stock valuation logic (calculate total stock value based on cost prices)
  - [ ] Create endpoints for tracking most profitable items based on margins
  - [ ] Develop API for identifying top sold items by quantity
  - [ ] Optimize low stock detection and alerting system
  - [ ] Create simplified inventory count and reconciliation process
  - [ ] Add stock movement tracking for production in/out, sales, purchases
  - [ ] Implement stock adjustment endpoints for inventory reconciliation
  - [ ] Integrate purchase functionality for raw materials acquisition
  - [ ] Create automatic cost calculation when purchases are recorded
  - [ ] Implement endpoints for purchase order management
  - [ ] Add supplier management functionality
  - [ ] Write unit and integration tests for refactored endpoints
- [ ] **Stock Module Refactoring (Frontend)**
  - [ ] Create new Stock dashboard component with overview metrics
  - [ ] Implement StockList component for viewing all stock items
  - [ ] Develop StockTransactionForm for recording stock movements
  - [ ] Create StockValuationReport component for financial tracking
  - [ ] Build TopSellingProducts and MostProfitableProducts components
  - [ ] Implement LowStockAlerts component with configurable thresholds
  - [ ] Create StockCount workflow components for periodic inventory counts
  - [ ] Add BOM creation and management within Stock module
  - [ ] Implement Purchase management UI for raw materials
  - [ ] Create supplier management interface
  - [ ] Develop purchase order workflow components
  - [ ] Add automatic cost calculation display on purchases
  - [ ] Update navigation and routing to reflect new module structure
  - [ ] Design responsive layouts for all stock-related views
  - [ ] Implement custom hooks for stock data fetching and processing
- [ ] **Integration and Testing**
  - [ ] Connect frontend components to refactored backend endpoints
  - [ ] Test complete stock management workflow (add stock, create products, update stock)
  - [ ] Validate metrics calculations (stock value, profitability, top sellers)
  - [ ] Test BOM creation and management within Stock module
  - [ ] Verify purchase order creation and processing
  - [ ] Test automatic cost calculation for purchased items
  - [ ] Validate stock count and reconciliation process
  - [ ] Verify low stock alert functionality
  - [ ] Create end-to-end tests for critical stock operations
- [ ] **Documentation Updates**
  - [ ] Update PROJECT_OVERVIEW.md to reflect new Stock module structure
  - [ ] Create technical documentation for Stock API endpoints
  - [ ] Document purchase management functionality
  - [ ] Update user documentation with new Stock module workflows
  - [ ] Document stock data flow and business logic
  - [ ] Create data model diagrams for the refactored entities

## 🏭 Production Management Module

### Core Production Management - Status: ✅ COMPLETED

- ✅ Implement production management system
  - ✅ Create production types and database models
  - ✅ Implement production order API services
  - ✅ Create production order management interface
  - ✅ Implement production recording functionality
  - ✅ Create production order details views

### Production Management Enhancements - Status: 🔄 IN PROGRESS

- [x] Add advanced production management features
  - [x] Implement search and filtering for production orders
  - [x] Create production statistics and metrics dashboard
  - [x] Implement production reports with export options
  - [x] Add batch production tracking
  - [x] Implement quality control checkpoints
  - [x] Create notifications for completed production orders
- [x] Implement export of production reports to PDF/Excel (frontend)
- [x] Add quality control checkpoints to production recording workflow (backend & frontend)
- [x] Implement notifications for completed production orders (backend & frontend)
- [x] Add batch production tracking UI and reporting (frontend)
- [x] Add advanced filtering for production orders (by employee, BOM, date range) (frontend)
- [x] Add e2e and unit tests for production management features (backend & frontend)
- [x] Improve documentation for production API endpoints and frontend features

#### Discovered During Work

- [ ] (Add any new sub-tasks here as discovered)

## 📑 Bill of Materials (BOM) Module

### Core BOM Management - Status: ✅ COMPLETED

- ✅ Implement basic BOM functionality
  - ✅ Create BOM types and database models
  - ✅ Implement BOM API services
  - ✅ Create basic BOM management interface
  - ✅ Implement material requirements functionality

### BOM Enhancements - Status: 🔄 PLANNED

- [ ] Enhance BOM management system
  - [ ] Improve BOM component UI/UX
  - [ ] Add comprehensive material requirements calculation
  - [ ] Implement advanced cost calculation view
  - [ ] Support packaging (emballage) as a BOM item
  - [ ] Create BOM version control and history
  - [ ] Implement BOM comparison features
- [ ] Implement advanced product costing
  - [ ] Calculate material costs based on inventory valuation
  - [ ] Include packaging costs in product calculations
  - [ ] Create flexible employee cost allocation options
  - [ ] Track overhead and fixed cost allocation
  - [ ] Generate cost breakdown analytics

## 👨‍💼 Employee Management Module

### Core Employee Management - Status: ✅ COMPLETED

- ✅ Implement basic employee management
  - ✅ Create employee database models and types
  - ✅ Implement employee management API services
  - ✅ Create employee profiles and management interface
  - ✅ Implement basic attendance tracking
  - ✅ Create simple employee scheduling system

### Employee Management Enhancements - Status: 🔄 PLANNED

- [ ] Enhance employee management system
  - [ ] Add employee roles and skill sets
  - [ ] Track daily employee assignments to different products
  - [ ] Implement comprehensive scheduling system
  - [ ] Create employee performance metrics
- [ ] Implement salary and bonus management
  - [ ] Create base salary configuration for roles
  - [ ] Implement timesheet tracking and validation
  - [ ] Develop performance-based bonus calculation
  - [ ] Create payroll and performance reporting

## 💰 Sales Management Module

### Core Sales Management - Status: ✅ PARTIALLY COMPLETED

- ✅ Implement basic sales recording
  - ✅ Create sales database models and types
  - ✅ Implement sales API services
  - ✅ Create sales list and form components
  - ✅ Implement CRUD operations for sales
  - ✅ Add basic sales reporting endpoints

### Sales Management Enhancements - Status: 🔄 PLANNED

- [ ] Implement door-to-door sales workflow
  - [ ] Create mobile-friendly interface for door-to-door salespeople
  - [ ] Implement end-of-day sales reconciliation
  - [ ] Add offline mode for areas with poor connectivity
  - [ ] Create sales team dashboard with performance metrics
- [ ] Implement business client order management
  - [ ] Create specialized order form for business clients
  - [ ] Implement recurring order functionality
  - [ ] Add business customer management
  - [ ] Create business customer invoicing with payment tracking
- [ ] Implement invoice generation
  - [ ] Create invoice template system
  - [ ] Implement invoice generation UI and logic
  - [ ] Add invoice export options (PDF/Excel)

## 🛒 Purchase Management Module

### Purchase Management - Status: 📝 PLANNED

- [ ] **Purchase Module Development (Backend)**

  - [ ] Create purchase database models and types (Supplier, PurchaseOrder, PurchaseOrderItem)
  - [ ] Implement purchase API services (PurchaseService, SupplierService)
  - [ ] Develop endpoints for supplier management
  - [ ] Create purchase order creation and tracking endpoints
  - [ ] Implement purchase receipt functionality with stock updates
  - [ ] Add automatic cost calculation for raw materials
  - [ ] Create purchase reporting and analytics endpoints
  - [ ] Build integration with Stock module for inventory updates
  - [ ] Add validation for purchase orders based on stock needs
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
