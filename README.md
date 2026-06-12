# 🚀 OrderTracker — Real-Time Delivery Platform

A full-stack .NET 8 + React real-time order tracking system with live GPS, SignalR WebSockets, JWT auth, and Google Maps integration.

---

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)
        ↕ SignalR WebSockets + REST API
Backend (ASP.NET Core 8 — Clean Architecture)
   ├── OrderTracker.API        → Controllers, SignalR Hubs, Middleware
   ├── OrderTracker.Application → Business Logic Services
   ├── OrderTracker.Infrastructure → EF Core, Repositories, DB
   └── OrderTracker.Core       → Entities, DTOs, Interfaces, Enums
        ↕
SQL Server + Hangfire (Background Jobs)
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | ASP.NET Core 8 |
| Real-time | SignalR (WebSockets) |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| Auth | JWT Bearer Tokens |
| Background Jobs | Hangfire |
| Caching | Redis (optional) |
| SMS | Twilio |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Maps | Google Maps JS API |
| Charts | Recharts |

---

## 🚦 User Roles & Features

### 👤 Customer
- Register / Login
- Place new orders with pickup + delivery address
- Real-time order status updates (pushed via SignalR)
- Live driver GPS tracking on map
- Order history

### 🚚 Driver
- Accept / manage assigned orders
- Update order status (Picked Up → In Transit → Delivered)
- Live GPS location broadcasting to admin + customer
- Toggle availability

### 🛡️ Admin
- Full order management dashboard
- Live map of all active drivers
- Assign drivers to orders
- Revenue + analytics dashboard
- Hangfire background job monitoring

---

## 🛠️ Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server (LocalDB or full)
- Node.js 18+
- Google Maps API Key

### Backend Setup

```bash
cd backend/OrderTracker.API

# Update connection string in appsettings.json
# Update Google Maps key in index.html
# Update Twilio credentials in appsettings.json

dotnet restore
dotnet ef database update
dotnet run
# API runs at http://localhost:5000
# Swagger at http://localhost:5000/swagger
# Hangfire at http://localhost:5000/hangfire
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

---

## 📡 SignalR Events

| Event | Direction | Description |
|---|---|---|
| `NewOrderCreated` | Server → Admin | New order placed |
| `OrderStatusChanged` | Server → Customer/Admin | Status updated |
| `OrderAssigned` | Server → Driver | New order assigned |
| `DriverLocationUpdated` | Server → Admin/Customer | Live GPS position |
| `UpdateDriverLocation` | Client → Server | Driver sends GPS |

---

## 🗄️ Database Schema

```
Users (Id, Name, Email, PasswordHash, Phone, Role, IsActive)
Orders (Id, OrderNumber, CustomerId, DriverId, Status, PickupAddress, DeliveryAddress, TotalAmount)
OrderItems (Id, OrderId, Name, Quantity, Price)
DriverProfiles (Id, UserId, VehicleType, CurrentLat, CurrentLng, IsAvailable)
OrderStatusHistories (Id, OrderId, Status, Comment, ChangedAt, ChangedBy)
```

---

## 🔐 API Endpoints

```
POST /api/auth/login
POST /api/auth/register

GET  /api/orders              [Admin]
GET  /api/orders/{id}
GET  /api/orders/my-orders    [Customer]
GET  /api/orders/driver-orders [Driver]
GET  /api/orders/pending      [Admin/Driver]
POST /api/orders              [Customer]
PUT  /api/orders/status       [Admin/Driver]
PUT  /api/orders/assign-driver [Admin]
GET  /api/orders/dashboard    [Admin]

POST /api/drivers/location    [Driver]
POST /api/drivers/availability [Driver]
GET  /api/drivers/active-locations

WS  /hubs/orders              [All - JWT required]
```

---

## 🔑 Default Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@ordertracker.com | Admin@123 |

---

## 📁 Project Structure

```
OrderTracker/
├── backend/
│   ├── OrderTracker.sln
│   ├── OrderTracker.API/
│   │   ├── Controllers/Controllers.cs
│   │   ├── Hubs/OrderHub.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── OrderTracker.Core/
│   │   ├── Entities/
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   └── Enums/
│   ├── OrderTracker.Infrastructure/
│   │   ├── Data/AppDbContext.cs
│   │   └── Repositories/Repositories.cs
│   └── OrderTracker.Application/
│       └── Services/Services.cs
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Admin/     (Dashboard, Orders, Map)
    │   │   ├── Customer/  (Dashboard, OrderDetail)
    │   │   └── Driver/    (Dashboard)
    │   ├── services/      (api.ts, signalr.ts)
    │   ├── context/       (authStore.ts)
    │   └── types/         (index.ts)
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Deployment

### Docker (coming soon)
```bash
docker-compose up --build
```

### Azure
- Deploy API to Azure App Service
- Use Azure SQL Database
- Use Azure SignalR Service (scale-out)
- Use Azure Cache for Redis

---

## 📄 License
MIT — Free to use for commercial projects.
