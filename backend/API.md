# DomDom API Documentation

## Authentication

Base URL: `/api/auth`

### Endpoints

- `POST /login` - User login
- `POST /register` - User registration
- `POST /refresh` - Refresh access token

## Sales Management

Base URL: `/api/sales`

### Direct Sales

- `POST /direct` - Create direct sale
  ```typescript
  {
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    paymentMethod: 'cash' | 'card';
    customerInfo?: {
      name: string;
      contact: string;
    };
  }
  ```

### Commercial Sales

- `POST /commercial/assign` - Assign products to commercial agent
  ```typescript
  {
    agentId: string;
    assignments: Array<{
      productId: string;
      quantity: number;
    }>;
  }
  ```
- `POST /commercial/return` - Record returned products and sales
  ```typescript
  {
    agentId: string;
    returns: Array<{
      productId: string;
      returnedQuantity: number;
      soldQuantity: number;
      unitPrice: number;
    }>;
  }
  ```

### Invoices

- `GET /invoices` - List all invoices
- `GET /invoices/:id` - Get invoice details
- `GET /invoices/:id/download` - Download invoice PDF
- `POST /invoices/:id/send` - Send invoice by email

## BOM (Bill of Materials)

Base URL: `/api/bom`

### BOM Management

- `GET /` - List all BOMs
- `POST /` - Create new BOM
- `GET /:id` - Get BOM details
- `PUT /:id` - Update BOM
- `DELETE /:id` - Delete BOM

### Material Requirements

- `GET /:id/requirements` - Calculate material requirements
  ```typescript
  Query params: {
    quantity: number; // Desired production quantity
  }
  ```
- `GET /:id/availability` - Check material availability
- `GET /:id/cost` - Calculate production cost

### Production Orders

- `POST /production-orders` - Create production order
  ```typescript
  {
    bomId: string;
    quantity: number;
    plannedStartDate: string;
    priority: 'low' | 'medium' | 'high';
  }
  ```
- `GET /production-orders` - List production orders
- `PUT /production-orders/:id/status` - Update order status
- `GET /production-orders/:id/progress` - Get production progress

## Employee Management

Base URL: `/api/employees`

### Attendance

- `POST /attendance/clock-in` - Record clock in
- `POST /attendance/clock-out` - Record clock out
- `GET /attendance` - Get attendance records
  ```typescript
  Query params: {
    employeeId?: string;
    startDate: string;
    endDate: string;
  }
  ```

### Production Output

- `POST /output` - Record production output
  ```typescript
  {
    employeeId: string;
    productionOrderId: string;
    quantity: number;
    quality: 'good' | 'defect';
    comments?: string;
  }
  ```
- `GET /output` - Get production output records
- `GET /performance` - Get employee performance metrics

## Document Generation

Base URL: `/api/documents`

### Templates

- `GET /templates` - List available templates
- `POST /templates` - Create document template
- `GET /templates/:id` - Get template details
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Document Generation

- `POST /generate` - Generate document from template
  ```typescript
  {
    templateId: string;
    data: Record<string, any>; // Template data
    format: 'pdf' | 'excel';
  }
  ```
- `GET /documents` - List generated documents
- `GET /documents/:id/download` - Download generated document

## Dashboard & Analytics

Base URL: `/api/analytics`

### Metrics

- `GET /metrics/sales` - Get sales metrics
- `GET /metrics/production` - Get production metrics
- `GET /metrics/inventory` - Get inventory metrics
- `GET /metrics/employees` - Get employee metrics

### Reports

- `GET /reports/sales` - Generate sales report
- `GET /reports/production` - Generate production report
- `GET /reports/inventory` - Generate inventory report
- `GET /reports/employee` - Generate employee report
  ```typescript
  Query params: {
    startDate: string;
    endDate: string;
    format: 'json' | 'pdf' | 'excel';
  }
  ```

## Bill & Maintenance Reminders

Base URL: `/api/reminders`

### Bills

- `POST /bills` - Create bill reminder
  ```typescript
  {
    title: string;
    amount: number;
    dueDate: string;
    frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
    category: string;
    notifyBefore: number; // Days before due date
  }
  ```
- `GET /bills` - List bill reminders
- `PUT /bills/:id` - Update bill reminder
- `DELETE /bills/:id` - Delete bill reminder

### Maintenance

- `POST /maintenance` - Create maintenance reminder
  ```typescript
  {
    assetId: string;
    title: string;
    description: string;
    scheduledDate: string;
    frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
    priority: 'low' | 'medium' | 'high';
    notifyBefore: number; // Days before scheduled date
  }
  ```
- `GET /maintenance` - List maintenance reminders
- `PUT /maintenance/:id` - Update maintenance reminder
- `DELETE /maintenance/:id` - Delete maintenance reminder

### Notifications

- `GET /notifications` - Get all notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `POST /notifications/settings` - Update notification settings
