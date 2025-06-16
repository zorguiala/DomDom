# Stock Management Module

## Overview

The Stock Management module handles inventory tracking, stock counts, and product management. This module has been refactored to improve code organization, maintainability, and separation of concerns.

## Components

### Stock Count

- `stock-count.tsx`: Main component for stock count management
- `stock-count-columns.tsx`: Table column definitions for stock counts
- `stock-count-create-modal.tsx`: Modal for creating new stock counts
- `stock-count-details-modal.tsx`: Modal for viewing stock count details
- `stock-count-record-modal.tsx`: Modal for recording actual quantities

### Stock List

- `stock-list.tsx`: Component for displaying and managing stock items

### Stock Dashboard

- `dashboard/stock-dashboard.tsx`: Main component for displaying stock metrics and analytics
- `dashboard/metric-card.tsx`: Reusable card component for displaying metric statistics
- `dashboard/stock-data-table.tsx`: Reusable table component for displaying stock data
- `dashboard/use-dashboard-columns.tsx`: Custom hook for managing table column definitions

## Custom Hooks

### Stock Count Hooks

- `useStockCount`: Handles API interactions for stock count operations
- `useStockCountForms`: Manages form state and handlers for stock count forms

### Dashboard Hooks

- `useStockMetrics`: Manages fetching and state for stock metrics, low stock items, profitable products, and top sellers
- `useDashboardColumns`: Provides table column definitions for dashboard tables

### General Hooks

- `useSearch`: Generic search functionality for filtering items
- `useStock`: Handles API interactions for stock items

## Refactoring Changes

1. **Separation of Concerns**:

   - Extracted table column definitions to a separate file
   - Moved form handling logic to a custom hook
   - Created a generic search hook for filtering

2. **Code Organization**:

   - Reduced component complexity
   - Improved readability and maintainability
   - Followed project conventions

3. **Reusability**:
   - Created reusable hooks that can be used across the application
   - Improved component modularity

## Usage

The Stock Count component provides a complete interface for managing inventory counts:

1. View existing stock counts
2. Create new stock counts
3. Start counting process
4. Record actual quantities
5. View count details and variances

The component uses modals for different operations and provides a searchable table interface for viewing stock counts.
