# 💇‍♂️ Lumina - Salon & Barbershop Management SaaS (v3.0)

> **Lumina** เป็นแพลตฟอร์ม Cloud SaaS สำหรับการบริหารจัดการธุรกิจร้านทำผม ซาลอน และร้านตัดผม (Barbershop) แบบครบวงจร ครอบคลุมตั้งแต่ระบบเปิดบิลรับเงินหน้าร้าน (POS), ตารางจองคิว, จัดการค่าแรงช่างและคอมมิชชั่น, ควบคุมรายจ่ายร้าน, ไปจนถึงระบบหลังบ้านสำหรับผู้ดูแลระบบ (Super Admin)

---

## 📑 สารบัญ (Table of Contents)
- [1. สถาปัตยกรรมระบบ & Tech Stack](#1-สถาปัตยกรรมระบบ--tech-stack)
- [2. โครงสร้างโฟลเดอร์ (Directory Structure)](#2-โครงสร้างโฟลเดอร์-directory-structure)
- [3. วิธีการติดตั้งและรันในเครื่อง (Getting Started)](#3-วิธีการติดตั้งและรันในเครื่อง-getting-started)
- [4. โครงสร้างฐานข้อมูล (Database Schema)](#4-โครงสร้างฐานข้อมูล-database-schema)
- [5. ฟีเจอร์หลักในเวอร์ชัน 3.0 (v3.0 Core Features)](#5-ฟีเจอร์หลักในเวอร์ชัน-30-v30-core-features)
- [6. ระบบความปลอดภัย & สิทธิ์ผู้ดูแล (Super Admin Portal)](#6-ระบบความปลอดภัย--สิทธิ์ผู้ดูแล-super-admin-portal)
- [7. กฎเหล็กและข้อควรระวังสำหรับ Dev (Critical Guidelines)](#7-กฎเหล็กและข้อควรระวังสำหรับ-dev-critical-guidelines)

---

## 1. สถาปัตยกรรมระบบ & Tech Stack

* **Frontend & Backend Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, SSR)
* **Styling & Design System:** Tailwind CSS v4 + Zinc Monochrome Theme
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security + Storage)
* **Data Visualization:** [Recharts](https://recharts.org/) (กราฟแท่งรายรับ 7 วันย้อนหลัง)
* **PWA (Progressive Web App):** Webmanifest + Apple Mobile Web App Standalone
* **Icons & Notifications:** Lucide React, Sonner (Toaster)
* **Multi-Language (i18n):** รองรับภาษาไทย (TH 🇹🇭) และภาษาอังกฤษ (EN 🇬🇧) ผ่าน Cookie

---

## 2. โครงสร้างโฟลเดอร์ (Directory Structure)

```text
silly-mendel/
├── public/                     # Static assets (โลโก้, ไอคอน PWA 192/512, manifest.json)
├── src/
│   ├── app/
│   │   ├── admin/              # 🛡️ Super Admin Portal (ดูสถิติทุกร้าน, อนุมัติสลิป)
│   │   │   ├── page.tsx        # Server Component ดึงข้อมูลภาพรวมทั้งระบบ
│   │   │   ├── AdminClient.tsx # Client Component ตารางร้านค้าและสลิป
│   │   │   └── actions.ts      # Server Actions สำหรับต่ออายุ/อนุมัติสลิป
│   │   ├── dashboard/          # 💈 หน้าร้านค้าหลัก (Salon Dashboard)
│   │   │   ├── page.tsx        # หน้าภาพรวม, Hero Card, กราฟรายได้ 7 วัน, เมนูด่วน
│   │   │   ├── appointments/   # ระบบคิวจอง & ปุ่ม Auto-Bill
│   │   │   ├── transactions/   # ระบบเปิดบิลรับเงิน POS & Smart Service Matcher
│   │   │   ├── services/       # จัดการรายการบริการ & ราคา
│   │   │   ├── staff/          # จัดการข้อมูลช่าง & สูตรคำนวณค่าแรง/คอมมิชชั่น
│   │   │   ├── expenses/       # จัดการรายจ่ายร้าน & สรุปยอดรายเดือน
│   │   │   ├── summary/        # สรุปกำไรขาดทุน (P&L), สลิปเงินเดือนช่าง, ภาษี
│   │   │   └── settings/       # ตั้งค่าร้าน & อัปโหลดสลิปต่ออายุ PRO
│   │   ├── login/              # หน้าเข้าสู่ระบบด้วย Google
│   │   ├── onboarding/         # หน้ากรอกชื่อร้านและอัปโหลดโลโก้สำหรับร้านเปิดใหม่
│   │   ├── manifest.ts         # PWA Webmanifest Generator ของ Next.js
│   │   └── layout.tsx          # Root Layout, PWA Meta Tags, Viewport Setup
│   ├── components/             # Reusable UI (LanguageSwitcher, Modals)
│   ├── dictionaries/           # คลังคำศัพท์ภาษาไทย (th.json) และอังกฤษ (en.json)
│   └── utils/
│       ├── admin.ts            # ฟังก์ชันตรวจสอบสิทธิ์ Super Admin (isAdminEmail)
│       ├── i18n.ts             # โหลดไฟล์ภาษาฝั่ง Server Components
│       └── supabase/           # Supabase SSR Clients (Server, Client, Middleware)
```

---

## 3. วิธีการติดตั้งและรันในเครื่อง (Getting Started)

### 3.1 ความต้องการของระบบ (Prerequisites)
* Node.js เวอร์ชัน 20 ขึ้นไป
* บัญชี Supabase และ Google Cloud OAuth

### 3.2 ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` ที่ Root Directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAILS=akachaiha@gmail.com
```

### 3.3 ติดตั้ง Dependencies และรันโปรเจกต์
```bash
# 1. ติดตั้งแพ็กเกจ
npm install

# 2. เริ่มต้นเซิร์ฟเวอร์สำหรับ Dev (ต้องใช้ Webpack ห้ามตัดคำสั่งออก)
npm run dev
```

> ⚠️ **ทำไมต้องใช้ `next dev --webpack`?**  
> เนื่องจาก Next.js เวอร์ชันนี้ใช้ร่วมกับ `@tailwindcss/postcss` ของ Tailwind CSS v4 ซึ่งตัว Turbopack Compiler ยังมีปัญหากับ PostCSS plugin การใช้ Webpack (`--webpack`) ทำให้คอมไพล์ผ่านฉลุย 100%

---

## 4. โครงสร้างฐานข้อมูล (Database Schema)

ตารางทั้งหมดผูกความปลอดภัยด้วย **Supabase Row Level Security (RLS)** แยกตาม `shop_id`:

1. **`shops` (ข้อมูลร้านค้า):**
   * `id`, `owner_id` (refs auth.users), `name`, `logo_url`
   * `plan_tier` (`trial` / `pro`), `plan_status` (`active` / `expired`), `plan_expires_at`
2. **`staff` (ทีมช่าง):**
   * `id`, `shop_id`, `name`, `image_url`, `is_active`
   * `wage_type` (`percent`, `daily`, `monthly`, `weekly`), `commission_percent`, `base_salary`
3. **`services` (บริการ & ราคา):**
   * `id`, `shop_id`, `name`, `price`, `duration_minutes`
4. **`appointments` (คิวจองล่วงหน้า):**
   * `id`, `shop_id`, `customer_name`, `customer_phone`, `appointment_date`, `appointment_time`, `service_name`, `staff_id`, `status` (`pending`, `completed`, `cancelled`)
5. **`transactions` (บิลรับเงิน POS):**
   * `id`, `shop_id`, `amount`, `payment_method` (`cash`, `transfer`), `staff_id`, `service_name`, `appointment_id`, `created_at`
6. **`expenses` (รายจ่ายของร้าน):**
   * `id`, `shop_id`, `category` (`rent`, `utilities`, `supplies`, `marketing`, `other`), `amount`, `expense_date`, `description`
7. **`payment_slips` (สลิปโอนเงินต่ออายุสมาชิก PRO):**
   * `id`, `shop_id`, `slip_url`, `amount`, `status` (`pending`, `approved`, `rejected`)

---

## 5. ฟีเจอร์หลักในเวอร์ชัน 3.0 (v3.0 Core Features)

### 5.1 📊 กราฟรายได้ 7 วันย้อนหลัง (Revenue Chart)
* ใช้ `Recharts` แสดง Bar Chart บน Hero Card หน้า Dashboard
* คำนวณรายได้ย้อนหลัง 7 วันจากตาราง `transactions` และไฮไลท์แท่ง "วันนี้" เป็นสีดำเข้ม

### 5.2 ⚡ คิวจองสู่การเปิดบิลอัตโนมัติ (Appointment → Auto-Bill)
* ในหน้ารายการคิว มีปุ่ม **`เสร็จ → เปิดบิลรับเงิน`**
* ส่งข้อมูลผ่าน Query Parameter มายังหน้าเปิดบิล โดยใช้ฟังก์ชัน **`smartMatchServices()`** จับคู่ชื่อบริการและคำนวณราคาให้อัตโนมัติ (รองรับบริการหลายรายการ เช่น "ตัดผม + สระไดร์")
* เมื่อเปิดบิลสำเร็จ จะอัปเดตสถานะคิวเดิมเป็น `completed` ทันที

### 5.3 📱 ติดตั้งเป็นแอปมือถือ (PWA Mobile Standalone)
* กำหนด `manifest.ts` ให้เปิดแบบ **`display: "standalone"`** เมื่อผู้ใช้กด "เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)" บน iOS/Android จะเปิดแบบเต็มจอ ไร้แถบ URL เสมือนแอปแท้
* มีปุ่ม **"แตะเลือกเวลาด่วน"** ในฟอร์มคิวจอง (เช่น 10:00, 11:00, 12:00) ใช้งานบนมือถือได้ในสัมผัสเดียว

### 5.4 🇹🇭 ปุ่มเปลี่ยนภาษาไอคอนรูปธงชาติ (Language Switcher)
* แสดงผลเป็นรูปธงชาติทรงกลมแบบ SVG คมกริบทุกหน้าจอ: **ธงไทย 🇹🇭 (TH)** และ **ธงอังกฤษ 🇬🇧 (EN)**
* จัดเก็บค่าภาษาใน Cookie `lumina_lang` และโหลดข้อความจาก `src/dictionaries/`

---

## 6. ระบบความปลอดภัย & สิทธิ์ผู้ดูแล (Super Admin Portal)

* **เส้นทาง:** `/admin`
* **การตรวจสอบสิทธิ์:** ฟังก์ชัน `isAdminEmail()` ใน `src/utils/admin.ts` จะตรวจสอบว่าผู้ใช้คือ `akachaiha@gmail.com` หรืออีเมลที่ระบุใน `ADMIN_EMAILS`
* **Role Switcher:** 
  * เมื่อล็อกอินด้วยอีเมล Admin จะมีปุ่มสีทอง **`[ 🛡️ Dev Admin ]`** ที่มุมขวาบนของหน้าร้าน
  * ในหน้า Admin มีปุ่ม **`[ 💈 กลับไปหน้าร้านของฉัน ]`** ให้สลับโหมดได้โดยไม่ต้องล็อกเอาท์
* **ความสามารถของ Super Admin:**
  * ดูตัวเลขสถิติรวมทั้งระบบ (GMV รวม, บิลทั้งหมด, ร้านค้าที่ Active วันนี้)
  * ตรวจสอบรายชื่อร้านค้าทั้งหมด พร้อมปุ่มลัด `+ 30 วัน PRO` แจกวันใช้งานฟรี
  * ตรวจสอบรูปสลิปโอนเงิน และกดปุ่ม `✓ อนุมัติ PRO (30 วัน)`

---

## 7. กฎเหล็กและข้อควรระวังสำหรับ Dev (Critical Guidelines)

> [!CAUTION]
> **1. ห้ามใช้ `supabase.auth.getUser()` ใน Server Components เด็ดขาด!**  
> การเรียก `getUser()` ใน Server Component (`page.tsx`, `layout.tsx`, Server Actions) จะส่ง Network Request ออกไปเช็คที่ Auth Server ส่งผลให้เว็บโหลดช้าถึง 3-5 วินาที!  
> 👉 **ให้ใช้ `supabase.auth.getSession()` เสมอ** เพราะอ่านจาก JWT Cookie ในเครื่อง โหลดเสร็จในไม่กี่มิลลิวินาที (ยกเว้นใน `middleware.ts` บรรทัดที่ 32 สำหรับรีเฟรชโทเค็นตามมาตรฐานความปลอดภัย)

> [!WARNING]
> **2. การแสดงผลวันที่บน Client Components (Hydration Mismatch Error #418)**  
> เซิร์ฟเวอร์รันใน Timezone UTC (ค.ศ.) แต่เบราว์เซอร์ผู้ใช้ในไทยรันในเวลาพุทธศักราช (พ.ศ.) หากใช้ `toLocaleDateString('th-TH')` ในไฟล์ที่มี `'use client'` **ต้องใส่ attribute `suppressHydrationWarning` ที่ Element นั้นเสมอ** เพื่อป้องกัน React Crash

> [!NOTE]
> **3. การพิมพ์สลิปเงินเดือน (Payslip)**  
> หน้า `/dashboard/summary/slip` ถูกออกแบบให้สั่งพิมพ์กระดาษได้ทันที โดยใช้แท็ก `<style>` ซ่อน `header, nav { display: none !important; }` ในโหมด Print

---

*จัดทำขึ้นเพื่อให้ทีมพัฒนาทุกคนสามารถอ่าน เข้าใจ และต่อยอดโปรเจกต์ Lumina v3 ได้ทันทีอย่างราบรื่น* 🚀
