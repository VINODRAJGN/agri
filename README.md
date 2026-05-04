# 🌾 Smart AgroConnect

An agricultural marketplace that connects **farmers directly with buyers**, eliminating middlemen and enabling fair trade. Built with React, TypeScript, Tailwind CSS, and Supabase. Features an **AI-powered chatbot** (Claude) and **AI price recommendations**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Role-based registration: Farmer, Buyer, Admin |
| 🛒 Marketplace | Browse, filter, and purchase fresh produce |
| 🌾 Farmer Dashboard | List, edit, delete products; toggle availability |
| 📦 Orders | Full order lifecycle: Pending → Confirmed → Shipped → Delivered |
| 🤖 AI Chatbot | Claude-powered assistant (replaces keyword-only bot) |
| 💰 AI Pricing | Market-data-based price recommendations for farmers |
| 🛡️ Admin Panel | Manage all users, products, and orders with full CRUD |
| 🔒 Security | Row-Level Security on all Supabase tables |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and **npm**
- A free **Supabase** account at [supabase.com](https://supabase.com)

---

### Step 1 — Clone & Install

```bash
# Extract the project zip and enter the folder
cd VR-main

# Install dependencies
npm install
```

---

### Step 2 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it (e.g. `smart-agroconnect`), set a strong DB password, choose a region
3. Wait ~2 minutes for the project to be ready

#### Run the Database Migration

1. In your Supabase dashboard, click **SQL Editor** → **New Query**
2. Open the file: `supabase/migrations/20260331163521_create_smart_agroconnect_schema.sql`
3. **Copy the entire file contents** and paste into the SQL editor
4. Click **Run** — you should see "Success. No rows returned"

This creates all 5 tables (profiles, products, orders, order_items, price_history) with security policies.

#### Get Your API Keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon / public** key → a long JWT string

---

### Step 3 — Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and fill in your Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 4 — Create Admin Account

The admin account is created via a Supabase Edge Function. You have two options:

#### Option A: Via the App UI (Recommended)

1. Start the app: `npm run dev`
2. Open [http://localhost:5173](http://localhost:5173)
3. Click **Admin Setup** on the landing page
4. This calls the Edge Function to create an admin user

> **Note:** The Edge Function (`supabase/functions/create_admin_user/index.ts`) must be deployed to Supabase first. See [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions).

#### Option B: Directly in Supabase (Easiest)

1. In Supabase dashboard → **Authentication** → **Users** → **Add User**
2. Enter email + password → **Create User**
3. Copy the new user's **UUID**
4. Go to **SQL Editor** and run:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'paste-uuid-here',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

---

### Step 5 — Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 👥 User Roles

### 🌾 Farmer
- Register with role = **Farmer**
- Log in → land on **My Products** page
- Add products with name, category, price, quantity, location
- Use **AI Price** button to get market-based price suggestions
- Toggle product availability; edit or delete listings
- View and manage orders from buyers (confirm → ship → deliver)

### 🛒 Buyer
- Register with role = **Buyer**
- Log in → land on **Marketplace**
- Browse and filter products by category or search
- Set quantity and add to cart
- Checkout with delivery address and payment method
- Track orders in **My Orders**

### 🛡️ Admin
- Created via Admin Setup or directly in Supabase
- Log in → land on **Admin Dashboard**
- **Overview tab:** Platform stats (users, products, orders, revenue)
- **Users tab:** View all registered users with roles
- **Products tab:** View all listings; delete any product
- **Orders tab:** View all orders; force-deliver or cancel

---

## 🤖 AI Features

### AI Chatbot (Claude-powered)
Click the green chat bubble (bottom-right). The chatbot is powered by Claude and can answer questions about:
- How to sell or buy products
- Payment methods
- Order tracking
- Account management

> The chatbot calls the Anthropic API directly from the browser. This works in development but for production, route API calls through your backend to protect keys.

### AI Price Recommendation
When a farmer adds or edits a product, clicking **AI Price** button:
1. Queries the `price_history` table for the same category
2. Calculates the average of recent prices
3. Adds a small random variation (±10%) for market realism
4. Displays recommended price; farmer can accept with one click

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Chatbot.tsx          # AI chatbot (Claude-powered)
│   ├── Navbar.tsx           # Role-based navigation
│   └── AddProductModal.tsx  # Add/edit product form
├── contexts/
│   ├── AuthContext.tsx       # Auth + profile state
│   └── CartContext.tsx       # Shopping cart state
├── lib/
│   └── supabase.ts          # Supabase client + TypeScript types
├── pages/
│   ├── Landing.tsx          # Public landing page
│   ├── Login.tsx            # Login form
│   ├── Register.tsx         # Registration form
│   ├── AdminSetup.tsx       # One-time admin creation
│   ├── Orders.tsx           # Order list (buyer + farmer)
│   ├── admin/
│   │   └── AdminDashboard.tsx  # Full admin panel (4 tabs)
│   ├── buyer/
│   │   ├── Marketplace.tsx  # Product browse + cart
│   │   └── Cart.tsx         # Checkout flow
│   └── farmer/
│       └── FarmerProducts.tsx  # Product management
└── App.tsx                  # Routing + layout

supabase/
├── migrations/
│   └── ...schema.sql        # Complete DB schema + RLS policies
└── functions/
    └── create_admin_user/   # Edge function for admin creation
```

---

## 🛠️ Available Scripts

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
```

---

## 🔒 Security Notes

- All tables use **Row Level Security (RLS)** — users can only access their own data
- Admin users can access all data via special policies
- Farmers can only edit/delete their own products
- Buyers can only see their own orders
- The AI chatbot calls Anthropic API from the browser — for production, proxy through a backend server

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| "Missing Supabase environment variables" | Check your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Login fails | Confirm the user exists in Supabase Auth AND has a row in the `profiles` table |
| Products not showing in marketplace | Ensure `is_available = true` and `quantity_available > 0` |
| Admin can't see all users/products | Verify your profile has `role = 'admin'` in the profiles table |
| Edge function fails | Deploy it using `supabase functions deploy create_admin_user` or use Option B above |
| Price history insert fails | Apply the updated migration SQL which grants insert to farmers |

---

## 📄 License

MIT
