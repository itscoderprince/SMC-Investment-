# 🚀 SMC - Wealth Management & Investment Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)

## 🌟 Overview

**SMC** is an enterprise-grade, full-stack investment and wealth management platform. Designed to offer a seamless financial experience, it enables users to securely invest in curated market indices, track portfolio performance, and earn weekly returns. The platform is complete with robust KYC verification workflows, a comprehensive Admin portal, crypto payment integrations, and role-based access control.

Built as a modern Single Page Application (SPA) experience using **Next.js App Router**, it focuses on performance, security, and a premium User Interface.

---

## 🔥 Key Features

### 👨‍💼 For Investors (User Portal)
- **Interactive Dashboard:** Real-time portfolio tracking, return history, and investment analytics using interactive charts (`Recharts`).
- **Investment Management:** Browse and securely invest in top-performing financial indices.
- **Wallet & Transactions:** Manage funds, submit crypto deposit requests, and initiate withdrawals.
- **KYC Verification System:** Secure identity document upload and verification flow.
- **Referral Program:** Multi-level referral system to invite friends and earn bonuses.
- **Support System:** Built-in ticketing system for user assistance.

### 🛡️ For System Administrators (Admin Portal)
- **Platform Analytics Overview:** Centralized dashboard to view system health, active investments, and user growth.
- **User & KYC Management:** Review, approve, or reject user KYC submissions to ensure regulatory compliance.
- **Financial Controls:** Process, approve, or reject withdrawal and payment deposit requests.
- **Investment Operations:** Manage index offerings and monitor platform-wide investment activities.

---

## 💻 Tech Stack & Tools

### **Frontend Engineering**
- **Framework:** Next.js 16 (App Router, Server Components)
- **Library:** React 19 (Hooks, React Compiler enabled)
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge`
- **UI Components:** Radix UI (Accessible Primitives), Shadcn concepts
- **Animations:** Framer Motion
- **State Management:** Zustand (Global State)
- **Forms & Validation:** React Hook Form + Zod SCHEMA
- **Data Visualization:** Recharts

### **Backend & Database Architecture**
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB
- **ORM:** Mongoose (Complex relational schemas for Investments, Returns, and Users)
- **Authentication:** Custom JWT generation/verification (`jose`), Password hashing (`bcryptjs`)
- **Storage:** Cloudinary (Secure media and KYC document storage)
- **Communications:** Resend (Transactional emails)

---

## 🏗️ Technical Architecture & Workflows

### 1. Security & Authentication Flow
- Custom built authentication system utilizing HTTP-only cookies and JSON Web Tokens (JWT).
- Strict **Role-Based Access Control (RBAC)** enforced at the Next.js `middleware.js` level to secure `/admin` and `/api` routes.
- Password encryption and securely managed user sessions.

### 2. State & Component Management
- **Zustand** is utilized for lightweight, fast, and scalable global state management (e.g., Auth Store).
- Highly modular React components ensuring code reusability and clean architecture.

### 3. Financial Data Modeling
- Complex Mongoose schemas linking `Users` to their `Investments`, tracking `ReturnHistory`, and aggregating `Withdrawal` and `PaymentRequest` data to guarantee transactional integrity.

---

## 🎯 Skills Showcased

This repository serves as a testament to various advanced software engineering skills:
- **Full-Stack Application Design:** From database schema design to responsive UI implementation.
- **Secure System Architecture:** Implementing middleware-protected routes, robust authentication, and KYC compliance workflows.
- **Financial Software Logic:** Handling simulated financial transactions, portfolio calculations, and ROI distribution mechanisms.
- **Modern React Ecosystem Mastery:** Leveraging Next.js 16 Server Components, React 19 optimizations, and advanced state management.
- **Third-Party API Integration:** Seamless integration of Cloudinary (storage) and Resend (email services).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Cluster URL
- Cloudinary Account Credentials
- Resend API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smc-main.git
   cd smc-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the required environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.
