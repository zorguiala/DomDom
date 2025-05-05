# DomDom - Food Production Management System

## Overview

DomDom is a comprehensive operational management system specifically designed for food production and manufacturing businesses. The system streamlines inventory management, production planning, sales tracking, employee management, and financial monitoring, with special emphasis on the unique workflows of food manufacturing operations.

## Key Features

- **Inventory Management**: Real-time tracking with low stock alerts based on daily consumption
- **Production Management**: BOM creation and production order tracking
- **Sales Management**: Tracks both direct company orders and door-to-door sales
- **Employee Management**: Attendance, productivity tracking, and performance-based bonuses
- **Supplier Management**: Track purchases from suppliers and manage supplier information
- **Vehicle Maintenance**: Scheduling and reminders for delivery van maintenance
- **Financial Tracking**: Monthly expenses, revenue tracking, and net profit calculation
- **Document Generation**: Invoices, delivery notes (bon de sortie), and custom reports
- [x] Production Management
  - [x] Core production order and recording
  - [x] Advanced filtering/search (employee, BOM, date, status)
  - [x] Batch production tracking
  - [x] Quality control checkpoints
  - [x] Notifications for completed orders
  - [x] Statistics dashboard
  - [x] Reports with export (PDF/Excel)
  - [x] Improved documentation and API docs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd DomDom
   ```

2. Install dependencies
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Create `.env` files in both backend and frontend directories
   - Configure database connection in backend

4. Start the development servers
   ```bash
   # Backend
   cd backend
   npm run start:dev

   # Frontend
   cd ../frontend
   npm run dev
   ```

## Project Structure

The project follows a modern client-server architecture with:

- **Frontend**: React with Ant Design, organized into feature modules
- **Backend**: NestJS with TypeORM, following modular structure
- **Database**: PostgreSQL relational database

## Documentation

For detailed documentation on the system architecture, requirements, and development roadmap, please refer to:

- [PLANNING.md](./PLANNING.md) - System architecture and development roadmap
- [Project Requirements Document.md](./Project%20Requirements%20Document.md) - Detailed requirements
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Component overview and implementation status
- [TASKS.md](./TASKS.md) - Current tasks and priorities