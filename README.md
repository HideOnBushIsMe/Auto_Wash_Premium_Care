<div align="center">

# 🚗 AutoWash Premium Care

### Smart Automated Car Wash — Booking & Loyalty System

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![SignalR](https://img.shields.io/badge/SignalR-Realtime-512BD4?logo=dotnet&logoColor=white)]()
[![VNPay](https://img.shields.io/badge/VNPay-Payment-0055A4)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A full-stack car wash booking platform** with membership loyalty program, real-time wash tracking with 3D simulation, QR check-in, VNPay payment integration, and AI chatbot support.

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Booking Flow](#-booking-flow)
- [Loyalty System](#-loyalty-system)
- [API Reference](#-api-reference)
- [Default Accounts](#-default-accounts)
- [Screenshots](#-screenshots)
- [Team](#-team)
- [License](#-license)

---

## ✨ Features

### 👤 Customer Portal
- 📅 **Smart Booking** — Book wash appointments with auto time-slot management and branch selection
- 🚙 **Vehicle Management** — Manage up to 5 vehicles with license plate validation
- 🏆 **Loyalty Program** — Earn points per transaction, auto tier upgrade/downgrade (Member → Silver → Gold → Platinum)
- 🎁 **Rewards & Vouchers** — Redeem points for rewards and apply promotion codes
- 🔔 **Real-time Notifications** — Booking status updates via SignalR
- 📊 **3D Wash Tracking** — Watch your car being washed in real-time with Three.js 3D simulation
- 💳 **Online Payment** — Secure checkout via VNPay
- 🤖 **AI Chatbot** — Integrated chat support with feedback system
- 🌐 **Multi-language** — Vietnamese & English (i18next)

### 👨‍🔧 Staff Dashboard
- 📋 **Queue Management** — View and manage daily bookings by branch
- 📱 **QR Scan Check-in** — Scan customer QR codes for instant check-in
- 🖥️ **Live Tracking** — Monitor wash bay status with IoT incident management
- ⚡ **Booking Flow Control** — Confirm → Check-in → Queue → Start → Complete → Checkout
- 🧾 **3-Step Checkout** — Summary → Service Details → Payment with detailed wash timeline

### 🛡️ Admin Back-office
- 📊 **Dashboard & Analytics** — Revenue charts, booking statistics, customer insights
- 🏢 **Branch Management** — CRUD branches, assign staff, manage wash bays
- 📦 **Package Management** — Create/update wash packages with features and pricing
- 🎯 **Promotion Engine** — Manage promotional campaigns with tier-based targeting
- 💰 **Transaction Audit** — Full payment audit trail with PDF invoice download
- 👥 **User & Staff Management** — Role management, account activation/deactivation
- ⭐ **Feedback Management** — Monitor booking feedback and chat feedback

### 🔧 Technical Highlights
- 🏗️ **Clean Architecture** — 4-layer separation (Domain → Application → Infrastructure → API)
- 🔒 **Race Condition Prevention** — Soft Lock (temporary hold) + Hard Lock (EF Core Optimistic Locking)
- 🔄 **Real-time Updates** — SignalR hubs for booking status and chat
- 📄 **PDF Invoices** — Auto-generated with QuestPDF including detailed wash steps
- 🔐 **JWT + Refresh Token** — Secure authentication with token rotation
- 📱 **Firebase OTP** — Phone number verification
- 🌍 **Google OAuth** — Social login integration

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Apps                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Customer   │  │    Staff     │  │    Admin     │      │
│  │   Portal     │  │  Dashboard   │  │  Back-office │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│              React 19 + TypeScript + Vite                   │
│              TailwindCSS + Radix UI (shadcn)                │
│              TanStack Query + React Three Fiber             │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API + SignalR WebSocket
┌───────────────────────────┼─────────────────────────────────┐
│                    ASP.NET Core 8.0                          │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │                    API Layer                         │    │
│  │         Controllers · Middleware · Swagger           │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │               Application Layer                      │    │
│  │      DTOs · Interfaces · Validators · Exceptions     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │              Infrastructure Layer                    │    │
│  │   Services · EF Core · SignalR Hubs · Migrations     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                 Domain Layer                          │    │
│  │            Entities · Enums (Pure Model)              │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│    ┌──────────┐  ┌────────┴───────┐  ┌──────────────┐       │
│    │  VNPay   │  │   SQL Server   │  │   Firebase   │       │
│    │ Payment  │  │   (EF Core)    │  │  Auth (OTP)  │       │
│    └──────────┘  └────────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend

| Component | Technology |
|---|---|
| Framework | .NET 8.0 / ASP.NET Core |
| Architecture | Clean Architecture (4 layers) |
| Database | SQL Server + Entity Framework Core 8 |
| Authentication | JWT Bearer (60 min) + Refresh Token (7 days) |
| Social Login | Google OAuth 2.0 |
| Phone Verification | Firebase Authentication SDK |
| Real-time | SignalR (Booking Hub + Chat Hub) |
| Payment Gateway | VNPay Sandbox |
| Validation | FluentValidation 11.9 |
| PDF Generation | QuestPDF |
| API Docs | Swagger / Swashbuckle |
| Password Hashing | BCrypt.Net |

### Frontend

| Component | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 + Radix UI (shadcn/ui) |
| State Management | TanStack React Query 5 |
| HTTP Client | Axios |
| Routing | React Router DOM 7 |
| 3D Simulation | React Three Fiber + Drei |
| Maps | Leaflet + Google Maps |
| Internationalization | i18next (vi/en) |
| Charts | Recharts |
| QR Code | html5-qrcode + qrcode.react |
| Form | React Hook Form |
| Notifications | Sonner (Toast) |

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) (with npm)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB or Express)
- [Git](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/HideOnBushIsMe/Auto_Wash_Premium_Care.git
cd Auto_Wash_Premium_Care
```

### 2️⃣ Backend Setup

```bash
cd Booking-Loyalty-System-BE

# Copy the example config and fill in your secrets
cp API/appsettings.Example.json API/appsettings.json
```

Edit `API/appsettings.json` with your actual values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AutoWashPro;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-at-least-32-characters-long",
    "Issuer": "AutoWashPro",
    "Audience": "AutoWashProClient"
  },
  "VnPay": {
    "TmnCode": "YOUR_VNPAY_TMNCODE",
    "HashSecret": "YOUR_VNPAY_HASHSECRET"
  }
}
```

```bash
# Restore packages & run (EF migrations + seed data run automatically)
dotnet restore
dotnet run --project API
```

> The API will be available at `https://localhost:7001` with Swagger UI at `/swagger`

### 3️⃣ Frontend Setup

```bash
cd Booking-Loyalty-System-FE

# Install dependencies
npm install

# Start dev server
npm run dev
```

> The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

### Backend — Clean Architecture

```
Booking-Loyalty-System-BE/
├── API/                            # Entry point
│   ├── Controllers/                # 36 controllers (Auth, Booking, Staff, Admin...)
│   ├── Middleware/                  # Global exception handler
│   └── Program.cs                  # Startup, JWT, DI, SignalR, CORS
│
├── Application/                    # Business contracts
│   ├── DTOs/                       # Request/Response models
│   ├── Interfaces/                 # Service interfaces
│   ├── Validators/                 # FluentValidation rules
│   └── Exceptions/                 # Custom AppException
│
├── Domain/                         # Pure domain (zero dependencies)
│   ├── Entities/                   # 30 entity classes
│   └── Enums/                      # 12 enum types
│
└── Infrastructure/                 # Implementation
    ├── Services/                   # ~25 service implementations
    ├── Persistence/                # EF DbContext + Configurations
    ├── Hubs/                       # SignalR (BookingHub, ChatHub)
    └── Migrations/                 # EF Core migrations
```

### Frontend — Feature-based Architecture

```
Booking-Loyalty-System-FE/src/
├── core/                           # Infrastructure
│   ├── api/                        # API client & endpoint definitions
│   ├── context/                    # Language & Theme providers
│   ├── guard/                      # Route protection (role-based)
│   ├── http/                       # Axios interceptor (JWT auto-refresh)
│   └── i18n/                       # Internationalization (vi/en)
│
├── features/products/              # Main feature module
│   ├── application/                # Custom hooks & business logic
│   ├── domain/                     # TypeScript interfaces
│   ├── infrastructure/             # API service calls
│   └── presentation/
│       ├── components/             # Reusable UI components
│       ├── layouts/                # Admin, Customer, Staff layouts
│       └── pages/                  # Route pages (~32 pages)
│
├── shared/                         # Shared components
│   ├── auto-wash-simulation.tsx    # 3D car wash simulation
│   ├── wash-process-timeline.tsx   # Wash step timeline
│   └── ...                         # 3D models, particles, effects
│
└── services/                       # Standalone services
```

---

## 🗄 Database Schema

### Core Entity Relationships

```
User ──1:1──► Customer ──1:N──► Vehicle
  │               │                 │
  └─1:1─► Staff   │ N:1            │ N:1
              │    ▼                ▼
              │  Tier           Booking ◄──N:1── WashPackage
              │                  │ │ │
              └──N:1── Branch ◄──┘ │ └──► BookingAddOn
                         │         │
                    1:N  │    1:1  │
                         ▼         ▼
                      WashBay   Payment
                         │
                    1:N  │
                         ▼
                      TimeSlot
```

### Key Entities (30 total)

| Entity | Description |
|---|---|
| `User` | Authentication (Email, Password, Role, OAuth) |
| `Customer` | Profile + Loyalty (Points, Tier, TotalWashes) |
| `Staff` | Staff profile linked to Branch |
| `Vehicle` | Customer vehicles (max 5, soft delete) |
| `Booking` | Core booking with full status lifecycle |
| `WashPackage` | Wash service packages with pricing |
| `Branch` | Physical locations with operating hours |
| `WashBay` | Wash stations within branches |
| `TimeSlot` | Availability slots per bay per date |
| `Tier` | Loyalty tiers (Member → Platinum) |
| `Payment` | VNPay transaction records |
| `Promotion` | Discount campaigns |
| `Reward` | Redeemable rewards catalog |
| `Notification` | Push notification records |
| `ChatSession` / `ChatMessage` | Customer support chat |
| `Feedback` | Post-service ratings |

---

## 🔄 Booking Flow

```
┌──────────┐     Staff      ┌───────────┐    Staff     ┌───────────┐
│ Pending  │───confirm────►│ Confirmed │───check-in──►│ CheckedIn │
└──────────┘               └───────────┘              └───────────┘
     │                          │                           │
     │ cancel                   │ cancel/no-show            │ queue
     ▼                          ▼                           ▼
┌───────────┐           ┌───────────┐               ┌──────────┐
│ Cancelled │           │  NoShow   │               │  Queued  │
└───────────┘           └───────────┘               └──────────┘
                                                          │
                                                          │ assign bay & start
                                                          ▼
                        ┌───────────┐              ┌──────────────┐
                        │CheckedOut │◄──checkout───│  Completed   │
                        │  (Final)  │              │              │
                        └───────────┘              └──────────────┘
                                                          ▲
                                                          │ wash done
                                                   ┌──────────────┐
                                                   │  InProgress  │
                                                   └──────────────┘
```

**Status Flow:** `Pending → Confirmed → CheckedIn → Queued → InProgress → Completed → CheckedOut`

---

## 🏆 Loyalty System

### Tier Structure

| Tier | Point Multiplier | Booking Window | Points to Reach | Maintenance (90 days) |
|---|---|---|---|---|
| 🥉 Member | ×1.0 | 7 days ahead | 0 | 0 |
| 🥈 Silver | ×1.2 | 10 days ahead | 500 | 300 |
| 🥇 Gold | ×1.5 | 12 days ahead | 1,500 | 1,000 |
| 💎 Platinum | ×2.0 | 14 days ahead | 5,000 | 3,000 |

### Points Calculation

```
Points = (TotalPrice / 1,000) × TierPointRate

Example: Premium Wash (120,000₫) + Gold Tier (×1.5)
→ (120,000 / 1,000) × 1.5 = 180 points
```

- **Auto Upgrade:** When `LifetimePoints ≥ NextTier.MinPointsRequired`
- **Auto Downgrade:** When 90-day rolling points < `CurrentTier.MaintenancePoints`

---

## 📡 API Reference

The API serves **70+ endpoints** across these modules:

| Module | Base Path | Auth | Endpoints |
|---|---|---|---|
| **Auth** | `/api/auth` | Public / Protected | Register, Login, Google OAuth, OTP, Refresh Token |
| **Booking** | `/api/bookings` | Customer | Create, View, Update, Cancel, History |
| **Staff Booking** | `/api/staff/bookings` | Staff/Admin | Confirm, Check-in, Queue, Start, Complete, Checkout, Cancel, No-show |
| **Vehicle** | `/api/vehicles` | Customer | Add, List, Delete |
| **Customer** | `/api/customers` | Customer | Get/Update Profile |
| **Loyalty** | `/api/loyalty` | Customer | Balance, History, Vouchers, Redeem |
| **Reward** | `/api/rewards` | Customer | Browse, Redeem, My Redemptions |
| **Payment** | `/api/payments` | Customer | Checkout (VNPay), IPN, Return |
| **Promotion** | `/api/promotions` | Public | Preview promo code |
| **Notification** | `/api/notification` | Protected | List, Unread Count, Mark Read |
| **Wash Packages** | `/api/wash-packages` | Public | List, Detail |
| **Tiers** | `/api/tiers` | Public | List, Detail |
| **Time Slots** | `/api/time-slots` | Protected | Weekly Summary |
| **Staff** | `/api/staff` | Staff | Profile, Create |
| **Admin** | `/api/admin/*` | Admin | Full CRUD for Branches, Packages, Bays, Users, Staff, Promotions, Rewards, Tiers, Analytics, Dashboard, Transactions, Bookings |

> 📖 Full API documentation available at `/swagger` when running the backend.

---

## 🔑 Default Accounts

After seeding, use these accounts to explore:

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | `admin@system.com` | `Admin@123` |
| 👨‍🔧 Staff | `staff@system.com` | `Staff@123` |
| 👤 Customer | `customer@system.com` | `customer` |

---

## 📸 Screenshots

<!-- Add your screenshots here -->

<div align="center">

| Landing Page | Customer Dashboard | Booking Flow |
|:---:|:---:|:---:|
| *Coming soon* | *Coming soon* | *Coming soon* |

| Staff Queue | 3D Wash Simulation | Admin Dashboard |
|:---:|:---:|:---:|
| *Coming soon* | *Coming soon* | *Coming soon* |

</div>

---

## 👥 Team

**Course:** SWP391 — Software Development Project  
**University:** FPT University HCM

<!-- Add team members here -->
<!--
| Name | Role | GitHub |
|---|---|---|
| Member 1 | Backend Lead | [@github](https://github.com/) |
| Member 2 | Frontend Lead | [@github](https://github.com/) |
| Member 3 | ... | [@github](https://github.com/) |
-->

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for SWP391 @ FPT University**

</div>
