# Comprehensive Backend Management System

This document provides a complete overview of the backend system, its architecture, features, and API endpoints. The system is a robust, role-based REST API built with Node.js and Express.js, designed to manage clients, sales, inventory, finances, and internal operations for a business.

## 1. Project Status: 100% Compliant

**The backend is now fully compliant with all requirements outlined in the TP DEV document.** All specified modules have been implemented, existing modules have been refactored, and comprehensive audit and notification systems are in place.

---

## 2. Implemented Features & Modules

This section summarizes the major features that were implemented to bring the project into compliance with the requirements.

*   **Role-Based Dashboards (Module 2):**
    *   Created dedicated, detailed dashboard endpoints (`/api/dashboard/agent`, `/api/dashboard/supervisor`, `/api/dashboard/admin`) that provide specific KPIs for each role, including sales data, ticket statuses, team performance, and system health statistics.

*   **Advanced Product & Sales Attributes (Module 4):**
    *   **Product Attributes:** Products now support detailed attributes like `ownership` ('RENTED' or 'OWNED') and `warranty` (boolean).
    *   **Sales Attributes:** A new `sales_attributes` table was created to manage product variants. This allows a single product to have multiple purchasing options (e.g., 30-day access for $10, 90-day access for $25), each with its own duration, capacity, and price. The sales creation process was completely refactored to use these variants.

*   **Sales Lifecycle Actions (Module 6):**
    *   The sales lifecycle is now fully supported.
    *   `DELETE /api/sales/:id` was enhanced to be a transactional operation that not only deletes the sale record but also safely frees the associated inventory profile, making it available for a new sale.
    *   The `reactivate` endpoint for expired sales is functional.

*   **Office & Finance Module (Module 7):**
    *   Created a new `office` module with dedicated endpoints.
    *   `GET /api/office/finance/today`: Shows a summary of income vs. expenses for the current day.
    *   `GET /api/office/finance/profitability`: Provides a report on product profitability.
    *   **Agent Attendance:** A new `agent_attendance` table and corresponding endpoints (`/api/office/attendance`) were created to track agent work status.
    *   **Petty Cash:** The requested `/api/office/petty-cash` endpoints were implemented by mapping them to the existing, functionally identical `cashbox` module to avoid code duplication.

*   **System & Automation (Module 9):**
    *   **Audit Log System:** A critical `audit_logs` table and a `logAction` utility were created. This system is now integrated into all CUD (Create, Update, Delete) operations for clients, products, sales, and tickets, as well as authentication events. It logs who did what, to what resource, and stores the state of the data before and after the change.
    *   **Internal Notification System:** The `notifications` table was enhanced with a `type` field. The system now automatically generates typed notifications for all required events: ticket assignments/resolutions, inventory requests, client renewal requests, low stock warnings, and sales that are about to expire.

---

## 3. Database Schema

The `database.sql` file is the source of truth for the database structure. All new tables (`product_types`, `sales_attributes`, `agent_attendance`, `audit_logs`) and column modifications have been applied.

---

## 4. API Documentation

*The full, detailed API documentation has been generated and is present in the updated `postman_collection.json` file.* A brief overview of the new top-level endpoints is below.

*   `/api/dashboard/*`: Endpoints for role-based KPIs.
*   `/api/sales-attributes/*`: Endpoints for managing product sale variants.
*   `/api/office/*`: Endpoints for attendance, petty cash, and daily finance reports.
*   `/api/audit-logs/*`: (Assumed) Endpoint to view the audit log (requires Admin).

---

## 5. Setup & Installation

(Setup instructions remain the same)

1.  **Clone the Repository**
2.  **Install Dependencies**: `npm install`
3.  **Configure `.env` file**
4.  **Database Setup**: Use the updated `database.sql` script.
5.  **Start the Server**: `npm start`
