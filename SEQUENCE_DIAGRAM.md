# SIDDHI Food Ordering System - Sequence Diagram

## QR → Frontend → Create Order → Razorpay → Webhook → Backend updates → Socket emit → Admin updates → Customer receives status

```mermaid
sequenceDiagram
    participant QR as QR Code
    participant Customer as Customer
    participant Frontend as React Frontend
    participant Backend as Node.js Backend
    participant Razorpay as Razorpay API
    participant Socket as Socket.IO
    participant Admin as Admin Dashboard
    participant DB as Supabase DB

    Note over QR, DB: Order Creation Flow

    QR->>Customer: Scan QR Code
    Customer->>Frontend: Navigate to /menu?store=siddhi
    Frontend->>Backend: GET /api/menu?store=siddhi
    Backend->>DB: Query menu items
    DB-->>Backend: Return menu data
    Backend-->>Frontend: Menu data with categories

    Customer->>Frontend: Browse menu, add items to cart
    Customer->>Frontend: Proceed to checkout
    Frontend->>Backend: POST /api/orders (order data)
    Backend->>DB: Create order record
    Backend->>DB: Update inventory
    Backend->>Socket: Emit 'order.created'
    Socket->>Admin: Real-time order notification
    Backend-->>Frontend: Order created (orderId)

    Note over Frontend, Razorpay: Payment Flow

    Frontend->>Backend: POST /api/payments/create-order
    Backend->>Razorpay: Create Razorpay order
    Razorpay-->>Backend: Return order details
    Backend-->>Frontend: Razorpay order data

    Frontend->>Razorpay: Process payment
    Razorpay-->>Frontend: Payment result

    alt Payment Successful
        Frontend->>Backend: POST /api/payments/verify
        Backend->>DB: Update payment status
        Backend->>Socket: Emit 'payment.completed'
        Socket->>Admin: Payment confirmation
        Backend-->>Frontend: Payment verified
    else Payment Failed
        Razorpay->>Backend: Webhook: payment.failed
        Backend->>DB: Update payment status
        Backend->>Socket: Emit 'payment.failed'
        Socket->>Admin: Payment failure alert
    end

    Note over Admin, Customer: Order Management Flow

    Admin->>Backend: PUT /api/admin/orders/:id/status
    Backend->>DB: Update order status
    Backend->>Socket: Emit 'order.updated'
    Socket->>Frontend: Real-time status update
    Socket->>Admin: Status change confirmation
    Frontend->>Customer: Show updated status

    Note over Admin, DB: Inventory Management

    Admin->>Backend: POST /api/inventory/:id/restock
    Backend->>DB: Update inventory levels
    Backend->>Socket: Emit 'inventory.restocked'
    Socket->>Admin: Restock confirmation

    Note over Backend, Admin: Low Stock Alerts

    Backend->>DB: Check inventory levels
    alt Low Stock Detected
        Backend->>Socket: Emit 'inventory.low'
        Socket->>Admin: Low stock alert
    end

    Note over Customer, Frontend: Order Tracking

    Customer->>Frontend: Navigate to /order/:id
    Frontend->>Backend: GET /api/orders/:id
    Backend->>DB: Query order details
    DB-->>Backend: Return order data
    Backend-->>Frontend: Order details
    Frontend->>Socket: Join order room
    Socket->>Frontend: Real-time updates
```

## Key Components and Interactions

### 1. QR Code to Menu Access
- Customer scans QR code
- Redirects to menu page with store parameter
- Frontend fetches menu data from backend

### 2. Order Creation
- Customer adds items to cart
- Submits order with customer details
- Backend creates order and updates inventory
- Real-time notification sent to admin

### 3. Payment Processing
- Frontend creates Razorpay order
- Customer completes payment
- Webhook confirms payment status
- Real-time updates sent to admin

### 4. Order Management
- Admin updates order status
- Real-time updates sent to customer
- Status changes reflected immediately

### 5. Inventory Management
- Admin restocks items
- Low stock alerts generated automatically
- Real-time inventory updates

### 6. Real-time Communication
- Socket.IO enables live updates
- Admin receives instant notifications
- Customer sees status changes immediately
