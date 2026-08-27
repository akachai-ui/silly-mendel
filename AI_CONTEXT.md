# 💇‍♂️ Lumina - Salon Management SaaS

## 📌 Project Overview
Lumina is a comprehensive SaaS platform designed for Salon and Barbershop management. It handles point-of-sale (POS) transactions, queue/appointment management, expense tracking, staff wage calculations (commissions/salaries), and generates electronic payslips. 

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **Icons & UI:** Lucide React, Sonner (for Toast notifications)
- **Deployment:** Vercel

## 🗄️ Database Schema
The database uses Supabase PostgreSQL with Row Level Security (RLS) enabled.
1. `shops`
   - `id`, `owner_id` (refs auth.users), `name`, `logo_url`
   - **Subscription Fields:** `plan_tier` (default: 'trial', 'pro'), `plan_status` (default: 'active', 'expired'), `plan_expires_at`
2. `services`
   - `id`, `shop_id`, `name`, `price`, `duration_minutes`
3. `staff`
   - `id`, `shop_id`, `name`, `image_url`
   - **Wage Fields:** `wage_type` ('percent', 'daily', 'monthly', 'weekly'), `commission_percent` (e.g., 50 for 50%), `base_salary`
4. `appointments` (Queue Management)
   - `id`, `shop_id`, `customer_name`, `customer_phone`, `appointment_date`, `appointment_time`, `service_name`, `staff_id`
   - `status` ('pending', 'completed', 'cancelled')
5. `transactions` (Income / POS)
   - `id`, `shop_id`, `amount`, `payment_method` ('cash', 'transfer'), `staff_id`, `service_name`, `appointment_id`, `created_at`
6. `expenses` (Shop Costs)
   - `id`, `shop_id`, `category` ('rent', 'utilities', 'supplies', 'marketing', 'other'), `amount`, `expense_date`, `description`
7. `payment_slips` (Subscription Payments)
   - `id`, `shop_id`, `slip_url`, `amount`, `status` ('pending', 'approved', 'rejected')

## 🚀 Key Architectural Decisions & AI Guidelines

### 1. Data Fetching & Performance (CRITICAL)
- **NEVER use `supabase.auth.getUser()` in Server Components (`layout.tsx` or `page.tsx`) for mere session checks.** It makes a network request to the Auth server and causes 3-5 seconds of loading delay.
- **ALWAYS use `supabase.auth.getSession()`** for fast SSR session validation because it only reads the local JWT cookie.

### 2. Client vs Server Components
- Heavily utilize Next.js Server Components for data fetching (`page.tsx`).
- Extract interactive elements (Modals, Forms, Lists with state) into Client Components (e.g., `ExpensesClient.tsx`, `TransactionForm.tsx`).

### 3. Hydration Mismatches (Error #418)
- Vercel's Node environment runs in UTC (Gregorian Calendar), while Thai users' browsers run in THA (Buddhist Calendar).
- **Rule:** Whenever using `Date.toLocaleDateString('th-TH')` or `toLocaleTimeString()` or `.toLocaleString()` inside a `'use client'` component, you **MUST** add `suppressHydrationWarning` to the HTML element containing the text to prevent React hydration crashes.

### 4. Layout & UI/UX Design
- **Mobile-First:** The app uses a Bottom Navigation bar for mobile screens (< md) and a side navigation for Tablets, configured in `DashboardNav.tsx`. 
- **Standalone PWA & Safari:** `viewport-fit=cover`, `appleWebApp: { capable: true }`, and `user-scalable=no` are enabled in `layout.tsx` to ensure it looks like a native iOS app.
- **Printable Documents (Payslips):** Instead of refactoring nested Next.js layouts, printable pages (like `/dashboard/summary/slip`) use an injected `<style>` tag to set `header, nav { display: none !important; }` globally on that page. It uses an explicit `<a href="/dashboard/summary">` for the Back button to force a full reload and clear the CSS.

### 5. Multi-language (i18n)
- Language preference is stored in the `lumina_lang` cookie ('th' or 'en'). 
- Dictionaries are loaded server-side via `src/utils/i18n.ts`.

## 🔮 Next Roadmap / Pending Features
- **Customer Booking Link (ระบบจองคิวออนไลน์สำหรับลูกค้า):** A public-facing page where customers can select a service, a staff member, and a time slot, which feeds directly into the `appointments` table.

---
*Generated for AI Context Persistence. Read this file before initiating new development cycles.*
