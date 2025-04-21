# Requirements Product Document (RPD) – DomDom Operational System MVP

## 1. Overview

**Product Name:** DomDom
**Industry:** Food Production & Manufacturing  
**Purpose:**  
To build an integrated system that manages inventory/stock, bills of manufacture (BOM), sales, employee production & attendance, invoicing, and custom document generation (e.g., "bon de sortie"). The system is primarily web-based, with the capability to package it as a Windows desktop application using Electron if needed.

## 2. Objectives and Goals

- **Primary Objectives:**
  - Streamline and automate stock management with real-time inventory tracking.
  - Simplify production planning and BOM management.
  - Automate sales recording and invoice generation.
  - Track and report employee production metrics and attendance.
  - Generate custom documents (e.g., "bon de sortie") for logistics and reporting.
- **Success Metrics:**
  - 95% accuracy and timeliness in inventory updates.
  - Reduction of manual data entry by 70%.
  - System uptime ≥ 99% during initial deployment.
  - Daily active user rate of ≥ 80% among designated operational staff.
  - Quick turnaround for document generation with export options in PDF/Excel.

## 3. Scope

**In-Scope:**

- **User Authentication & Role-based Access:**  
  Secure login, user accounts, and role-based permissions.
- **Inventory Management Module:**
  - Real-time tracking and updating of inventory levels (raw materials, work in process, finished goods).
  - Support for manual updates and barcode scanning.
- **BOM & Production Management:**
  - Create, manage, and update production recipes (BOMs).
  - Link raw material consumption to production orders.
- **Sales & Invoice Generation Module:**
  - Record sales orders.
  - Automatically generate and export invoices (PDF/Excel).
- **Employee Management Module:**
  - Track employee attendance (clock in/out).
  - Record production outputs for performance reporting.
- **Document Generation:**
  - Use predefined templates (e.g., "bon de sortie") with automated data fill from inventory and production.
- **Dashboard & Reporting:**
  - Display key operational metrics and trends.
  - Generate customizable reports on inventory, production, and sales.
- **Optional Electron Packaging (Windows Desktop App):**
  - The web interface can be packaged as a Windows desktop application using Electron.
  - Maintain a single codebase with minor desktop-specific adjustments (e.g., file system integration, native notifications).

## 4. Target Users & Stakeholders

- **Target Users:**
  - Production Managers
  - Inventory Supervisors
  - Sales & Accounting Teams
  - HR Personnel (attendance tracking)
- **Stakeholders:**
  - Business Owners and Decision Makers
  - IT/Development Team
  - End Users (Operational Staff)

## 5. Functional Requirements

1. **User Authentication & Security:**

   - Secure login and logout functionality with role-based access control.
   - Enforcement of password policies and robust session management.

2. **Inventory Management:**

   - Real-time inventory updates with the ability to view current stock levels and pricing.
   - Support for manual stock adjustments, with an optional feature for barcode scanning input.
   - Availability of detailed historical transaction logs for auditing purposes.

3. **BOM & Production Management:**

   - An intuitive interface for creating, editing, and managing Bills of Materials (BOMs).
   - Capability to link production orders with the consumption of raw materials and record associated pricing.

4. **Sales & Invoice Generation:**

   - Functionality for entering and editing sales orders.
   - Support for two types of sales:
     - **Direct Sale:** For walk-in customers, with a streamlined process: create sale → confirm payment (typically cash) → generate invoice and update inventory automatically.
     - **Commercial Sale:** For door-to-door sales by commercial agents. The process includes recording the initial product quantity supplied to the agent in the morning and, at day’s end, updating the sale record with the remaining product count from the vehicle.
   - Automatic invoice generation with export options (PDF/Excel).
   - Automatic inventory update following sales transactions.

5. **Employee Management:**

   - Attendance tracking with clock in/out functionality.
   - Recording and reporting of employee production outputs.

6. **Document Generation:**

   - Predefined templates for documents such as "bon de sortie" and other custom reports.
   - Automatic population of document fields from system data.

7. **Dashboard & Reports:**

   - A real-time analytics dashboard displaying key operational metrics.
   - Customizable reporting tools for inventory, production, and sales data.

8. **Optional Desktop Packaging:**

   - The ability to package the web application as a Windows desktop app using Electron.
   - Assurance of consistent functionality across both the web and desktop environments.

9. **Bill & Maintenance Reminders:**
   - Management and tracking of recurring monthly bills (e.g., electricity, rent, vehicle expenses).
   - A notification system to alert when maintenance is due for assets, such as vehicles in a fleet.

## 6. Non-Functional Requirements

- **Performance:**
  - Core API responses within 2 seconds.
- **Scalability:**
  - Designed to scale modularly as features are added.
- **Security:**
  - Data encryption (both at rest and in transit).
  - Compliance with data protection standards.
- **Usability:**
  - Intuitive and responsive UI optimized for web and desktop.
- **Reliability:**
  - Target system uptime of 99%.
- **Maintainability:**
  - Modular, well-documented codebase facilitating future updates.
- **Multi language:**
  - multi language interface
    -use themening for dark and light and best practice for themeing

## 7. Technical Architecture

### Backend

- **Language:** Node js
- **Framework:** nest js
- **Database:** PostgreSQL (or MongoDB if needed for semi-structured data)

### Frontend

- **Core Web Application:**
  - **Language:** JavaScript
  - **Framework:** React for styling tailwindcss or any lib you want to code faster
- **Optional Desktop Application:**
  - **Tool:** Electron (for Windows packaging)

### Infrastructure

- **Containerization:** Docker for consistent environment setup.
- **Cloud Hosting:** AWS, GCP, or Azure for scalability and high availability.
- **Version Control:** Git (hosted on GitHub or GitLab)

## 8. User Stories

- **US1:**  
  _As a Production Manager, I need to view live inventory data so that I can plan production runs accurately._
- **US2:**  
  _As an Inventory Supervisor, I want to update stock levels via barcode scanning or manual entry, ensuring data is current._
- **US3:**  
  _As a Sales Officer, I want the system to automatically generate and export invoices when a sale is recorded so that billing is seamless._
- **US4:**  
  _As an HR Manager, I need to track employee attendance and production outputs to generate accurate performance reports._
- **US5:**  
  _As a System Administrator, I want to provide an optional desktop version via Electron to support users who prefer a native Windows app, while keeping the web version as primary._

## 10. Assumptions, Constraints, and Dependencies

- **Assumptions:**
  - Relevant production and inventory data is available and formatted consistently.
  - Stakeholders will provide timely and clear feedback.
- **Constraints:**
  - Budget limitations for the MVP phase.
  - MVP must be delivered within a 5-month timeframe.
- **Dependencies:**
  - Third-party APIs for barcode scanning and payment (if invoice processing is linked to payment gateways).
  - Reliable cloud hosting infrastructure.
  - Electron compatibility and support for Windows packaging.

## 11. Risks & Mitigation Strategies

- **Module Integration Delays:**
  - _Mitigation:_ Use iterative development with regular stakeholder reviews and automated testing.
- **Electron Packaging Overhead:**
  - _Mitigation:_ Prioritize core web functionality and introduce Electron wrapping after achieving core stability.
- **User Adoption Challenges:**
  - _Mitigation:_ Engage end-users during the prototyping phase, conduct training, and implement iterative usability improvements.

## 12. Success Metrics & KPIs

- **Performance:**
  - Average API response time < 2 seconds.
- **User Adoption:**
  - ≥ 80% daily active users from operational teams.
- **Operational Efficiency:**
  - Reduction in manual entry errors by at least 70%.
- **Inventory Turnover:**
  - Improve inventory turnover rates by 20% within six months.
- **Desktop Packaging (Electron):**
  - Successful pilot deployment with at least a 50% adoption rate among targeted users (where applicable).

---

## Final Thoughts

This document serves as a living guide for the development of the DomDom Management System MVP. By using a web-first solution (with optional Electron packaging for Windows) and leveraging a tech stack of Python/Django for the backend and React for the frontend, the system aims to optimize inventory, production, sales, and employee management. Stakeholders and the development team should update this document iteratively as new feedback is incorporated or features evolve.

Happy developing!
