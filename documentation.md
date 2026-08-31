Product Requirements Document (PRD)

Project Name: Iran Gate Logistics Platform
Project Type: Cross-Border Proxy-Purchasing & Freight Forwarding System

1. Executive Summary

Iran Gate is a comprehensive e-commerce and logistics platform that allows local users to purchase products from foreign online stores. Because foreign stores often do not ship locally, Iran Gate acts as a proxy: users submit a product link, admins provide a fully-landed cost (item + shipping + customs), and upon payment, the Iran Gate team purchases the item.

The platform then tracks the physical movement of that package from a foreign warehouse, across borders via transit shipments, into a local warehouse, and finally to the customer's doorstep, driven by custom QR-code scanning at each warehouse.

2. User Personas & Roles (RBAC)

The system strictly enforces Role-Based Access Control (RBAC). Every user falls into one of four roles:

The Customer (customer)

Goal: Buy items from abroad easily and track their delivery.

Capabilities: Create orders with product URLs, description, photos and general information about the product; review quotes; pay; browse the public catalog; and receive push notifications on status updates.

The Administrator (admin)

Goal: Manage the orders created by the customers, verify order prices and informations provided by customers, and coordinate logistics.

Capabilities: Verify customer requests, verify orders pricing/shipping fees, record foreign purchases, create transit shipments, manage the public catalog, and set up warehouse facilities.

The Warehouse Operator (warehouse_operator)

Goal: Process physical packages efficiently without administrative clutter.

Capabilities: Scan QR codes to check packages in and out of their specifically assigned warehouse, and providing car and driver information for each out pachage. (Strictly isolated from viewing/scanning other warehouses).

The Owner (owner)

Goal: Securely manage the company's staff.

Capabilities: A super-admin role strictly for promoting/demoting users (e.g., turning a registered user into an admin or warehouse_operator).

3. The Application Suite

To serve these personas, the frontend is divided into four distinct user interfaces (which can be built as separate apps or one unified app with conditionally rendered dashboards):

App 1: Customer Portal (React Native/Expo Mobile App)

App 2: Admin Dashboard (React Native/Expo or Web)

App 3: Warehouse Management System (WMS) (React Native/Expo Mobile App)

App 4: Owner Panel (Web or Mobile)

4. The Core Workflow (The State Machine)

This is the most critical logic in the system. An Order strictly moves through these statuses. This workflow should drive your Scrum User Stories.

PENDING_QUOTATION: Customer creates an order and providing the necessery product details and estimated price and shipping details (like size and weight).

QUOTATION_PROVIDED: Admin reviews the order details, confirm price from the suppliers, calculates actual weight/volume/shipping, and sends the final price back to the Customer.

PAID: Customer accepts the quote and pays. Order is locked.

PURCHASED: Admin actually buys the item from the foreign store (which may be an e-commerce store or by making a call to the physical store, this is done outside the app) and inputs the supplier's tracking number.

ARRIVED_FOREIGN_WH: The package arrives at the Iran Gate foreign warehouse. A Warehouse Operator scans it to check it in. (Note: At this stage, Iran Gate's custom QR code is printed and attached).

DEPARTED_FOREIGN_WH: Operator scans the QR code as it is loaded onto a cross-border truck/plane (linking it to a Transit Shipment).

ARRIVED_LOCAL_WH: The package arrives in the destination country. Local Warehouse Operator scans it.

OUT_FOR_DELIVERY: Operator scans the package as it leaves the local warehouse with a final-mile courier.

DELIVERED: Final confirmation of receipt.

(Alternative Path: QUOTATION_REJECTED if the admin determines the requested item is illegal, out of stock, or un-shippable, or may be ORDER_CANCELED if the customer cancels the order before the PAID state).

5. Technical Architecture

Backend System: Go (Golang) using go-chi/chi for routing. Selected for high concurrency, speed, and single-binary deployment.

Database: PostgreSQL (Relational). Handles strict state machine transitions, complex warehouse-operator mappings, and immutable scan logs.

Authentication: JWT (JSON Web Tokens) with a 72-hour expiry.

Storage: Cloudflare R2 (S3-compatible) for highly scalable, zero-egress-fee storage of user-uploaded screenshots and product images.

Push Notifications: Expo Push Notification API. Integrated natively into the Go backend's state machine (fire-and-forget goroutines).

6. Scrum Epic Breakdown (For Backlog Planning)

Epic 1: Identity & Security

Story: As a user, I can register and login using email/password so my data is secure.

Story: As an Owner, I can assign the Admin or Operator role to existing users.

Story: As a system, I must block Operators from taking actions at warehouses they are not assigned to.

Epic 2: The Customer Experience

Story: As a Customer, I can paste a URL, add descriptions, and upload a screenshot to request an item.

Story: As a Customer, I receive a push notification when an Admin replies with a quotation.

Story: As a Customer, I can view a visual timeline of my package's journey.

Epic 3: Admin Operations

Story: As an Admin, I can view a list of PENDING_QUOTATION orders and input verified pricing, weight, and volume.

Story: As an Admin, I can manually confirm a customer's payment to lock the order.

Story: As an Admin, I can record the foreign supplier's tracking number so the foreign warehouse knows what to expect.

Story: As an Admin, I can create a Transit Shipment (Driver Name, Vehicle Plate) and attach orders to it.

Epic 4: Warehouse Logistics (WMS)

Story: As an Admin, I can create physical Warehouse locations and assign Operators to them.

Story: As an Operator, I can use my phone camera to scan an Order QR code.

Story: As an Operator, I can "Check In" or "Check Out" a package, which automatically updates the global order state.

Epic 5: The Public Catalog (Growth Engine)

Story: As an Admin, I can save successfully purchased custom orders into a sanitized "Public Catalog".

Story: As a Customer, I can browse this catalog to easily order previously verified items without waiting for a quotation.

7. Future Scope & Out-of-Bounds (Phase 2)

To prevent scope creep, the following are acknowledged but excluded from the MVP:

Automated Payment Gateways: Currently, payments are assumed to be handled via external links, wallet transfers (Zain Cash, etc.), or COD, with the Admin manually clicking "Confirm Payment" in the dashboard. Deep API integration with payment gateways is Phase 2.

Automated Web Scraping: Automatically fetching product details from a pasted e-commerce framework URL is complex due to captchas. For the MVP, the customer/admin manually types the order details.

Courier App: Currently, the system tracks up to OUT_FOR_DELIVERY. A separate app for the list-mile driver with GPS routing is Phase 2, or may not be implemented at all.
