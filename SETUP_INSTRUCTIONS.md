# Swiff App - Complete Setup Instructions

## Overview
Email verification has been **REMOVED**. Users can now sign up and immediately access the app without verifying their email.

---

## 1. Supabase Database Setup

### Step 1: Copy the SQL Script
Open the file: **[SUPABASE_COMPLETE_SETUP.sql](SUPABASE_COMPLETE_SETUP.sql)**

### Step 2: Run in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the entire SQL script
5. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Setup
The script includes a verification query at the end. You should see:

| check_name | status |
|------------|--------|
| users table exists | true |
| bills table exists | true |
| bill_participants table exists | true |
| personal_subscriptions table exists | true |
| settlements table exists | true |
| RLS enabled on users | true |
| user creation trigger exists | true |

---

## 2. Supabase Dashboard Configuration

### Step 1: Disable Email Confirmation
1. Go to **Authentication** > **Providers** > **Email**
2. **UNCHECK** the box: "Confirm email"
3. Click **Save**

### Step 2: Set Site URL
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173`
3. Click **Save**

### Step 3: Add Redirect URLs
1. In the same **URL Configuration** section
2. Add this to **Redirect URLs**:
   ```
   http://localhost:5173/**
   ```
3. Click **Save**

---

## 3. Frontend Configuration

### Step 1: Update .env.local
Open `.env.local` and set:

```env
# Set to false to use real Supabase (recommended for testing auth)
VITE_USE_MOCK_AUTH=false

# Your Supabase credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find your credentials:**
1. Go to Supabase Dashboard
2. Click **Settings** > **API**
3. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
4. Copy **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`

### Step 2: Restart Dev Server
```bash
npm run dev
```

---

## 4. Test the Setup

### Test 1: Sign Up
1. Go to `http://localhost:5173/signup`
2. Enter:
   - Display Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click **Sign Up**
4. You should be **immediately redirected to the dashboard** (no email verification needed!)

### Test 2: Create a Bill
1. Navigate to **Bills** page
2. Click **Add Bill**
3. Fill in bill details
4. Click **Save**
5. Verify the bill appears in the list

### Test 3: Add a Subscription
1. Navigate to **Subscriptions** page
2. Click **Add Subscription**
3. Fill in subscription details
4. Click **Save**
5. Verify the subscription appears in the list

### Test 4: View Balances
1. Navigate to **Balances** page
2. You should see "No balances yet" (since you haven't split any bills)
3. Create a split bill to test balance calculations

---

## 5. Database Tables Created

The SQL script creates these tables:

1. **users** - User profiles
2. **bills** - Individual bills with optional split
3. **bill_participants** - Participants in split bills
4. **personal_subscriptions** - Recurring subscriptions
5. **settlements** - Payment records between users

All tables have:
- Row Level Security (RLS) enabled
- Automatic timestamp updates
- Performance indexes
- Proper foreign key relationships

---

## 6. Changes Made to Remove Email Verification

### Frontend Changes:
1. **[PrivateRoute.jsx](swiff/src/routes/PrivateRoute.jsx)** - Removed email_confirmed_at check
2. **[App.jsx](swiff/src/App.jsx)** - Removed VerifyEmail and AuthCallback routes

### Backend Changes:
1. **Supabase Auth** - Email confirmation disabled in settings
2. **Database** - No email verification field required

---

## 7. Features Available

### Phase 1: Bills Management ✅
- Create, edit, delete bills
- Mark bills as paid/unpaid
- Split bills (equal, custom, percentage)
- Search and filter bills
- Recurring bills

### Phase 2: Balances & Settlements ✅
- View who owes you
- View who you owe
- Record settlements
- Settlement history

### Phase 3: Personal Subscriptions ✅
- Add, edit, delete subscriptions
- Track monthly/yearly costs
- Cancel/reactivate subscriptions
- Filter by category and status

---

## 8. Troubleshooting

### Problem: "Invalid JWT" error
**Solution:** Make sure you disabled email confirmation in Supabase dashboard

### Problem: Tables not created
**Solution:** Run the SQL script again. It uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### Problem: Can't create bills/subscriptions
**Solution:** Check that RLS policies are enabled. Run the verification query in the SQL script

### Problem: User not redirected after signup
**Solution:**
1. Check that `VITE_USE_MOCK_AUTH=false` in `.env.local`
2. Verify redirect URLs in Supabase dashboard
3. Check browser console for errors

---

## 9. Next Steps (Optional)

### Add Password Reset Page
The ForgotPassword page already exists at `/forgot-password`. To test:
1. Go to `http://localhost:5173/forgot-password`
2. Enter your email
3. Check email for reset link (requires email template setup in Supabase)

### Deploy to Production
When deploying:
1. Update redirect URLs in Supabase to your production domain
2. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in production environment
3. Keep email confirmation disabled (or enable it if you change your mind)

---

## Support

If you encounter any issues, check:
1. Browser console for errors
2. Supabase logs (Dashboard > Logs)
3. Network tab to see API requests

Happy coding! 🎉
