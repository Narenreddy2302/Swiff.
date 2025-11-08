# Swiff App - Supabase Setup Testing Checklist

## ✅ Configuration Checks

### 1. Environment Variables
- [x] **VITE_USE_MOCK_AUTH** = `false` (using real Supabase)
- [x] **VITE_SUPABASE_URL** = `https://kawgqkyvvfrzjifgsnvf.supabase.co`
- [x] **VITE_SUPABASE_ANON_KEY** = Set correctly
- [x] **Dev server restarted** after `.env.local` change

### 2. Supabase Database
- [x] **users table** exists
- [x] **bills table** exists
- [x] **bill_participants table** exists
- [x] **personal_subscriptions table** exists
- [x] **settlements table** exists
- [x] **RLS enabled** on all tables
- [x] **Triggers** created (user auto-creation, timestamp updates)

### 3. Supabase Dashboard Settings
- [ ] **Email confirmation DISABLED** (Authentication > Providers > Email)
- [ ] **Site URL** set to `http://localhost:5173`
- [ ] **Redirect URLs** includes `http://localhost:5173/**`

---

## 🧪 Functional Testing

### Test 1: User Registration ⭐ CRITICAL
**Goal:** Verify new users can sign up without email verification

**Steps:**
1. Open `http://localhost:5173/signup`
2. Fill in the form:
   - Display Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Phone: `+1234567890` (optional)
3. Click **Sign Up**

**Expected Results:**
- ✅ User is immediately redirected to `/dashboard` (NO email verification page)
- ✅ User sees their display name in the dashboard header
- ✅ No errors in browser console
- ✅ Check Supabase: User appears in **Authentication > Users**
- ✅ Check Supabase: User profile created in **Table Editor > users**

**If it fails:**
- Check Supabase dashboard: Email confirmation must be DISABLED
- Check browser console for errors
- Check Network tab for failed API requests

---

### Test 2: User Login
**Goal:** Verify existing users can log in

**Steps:**
1. Log out if logged in
2. Go to `http://localhost:5173/login`
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Click **Log In**

**Expected Results:**
- ✅ User redirected to `/dashboard`
- ✅ Dashboard shows user data
- ✅ No authentication errors

---

### Test 3: Create a Bill
**Goal:** Verify database write operations work

**Steps:**
1. Navigate to **Bills** page
2. Click **+ Add Bill**
3. Fill in:
   - Name: `Electric Bill`
   - Amount: `150.50`
   - Due Date: (select tomorrow)
   - Category: `Utilities`
4. Click **Save**

**Expected Results:**
- ✅ Bill appears in the bills list
- ✅ Check Supabase **Table Editor > bills**: Bill record exists
- ✅ Bill `user_id` matches your email (not a UUID - this is expected)
- ✅ No console errors

---

### Test 4: Create a Split Bill
**Goal:** Verify complex database operations with relationships

**Steps:**
1. Go to **Bills** page
2. Click **+ Add Bill**
3. Enable "Split this bill"
4. Fill in:
   - Name: `Dinner with Friends`
   - Amount: `120.00`
   - Due Date: (select date)
   - Category: `Food & Dining`
   - Split Method: **Equal**
5. Add participants:
   - Name: `Alice`, Email: `alice@example.com`
   - Name: `Bob`, Email: `bob@example.com`
6. Click **Save**

**Expected Results:**
- ✅ Bill created in `bills` table
- ✅ 2 participant records in `bill_participants` table
- ✅ Each participant shows correct share amount ($40.00 each for 3-way split)
- ✅ Bill shows as split in the UI

---

### Test 5: Add a Subscription
**Goal:** Verify subscriptions feature works

**Steps:**
1. Navigate to **Subscriptions** page
2. Click **+ Add Subscription**
3. Fill in:
   - Service Name: `Netflix`
   - Amount: `15.99`
   - Billing Cycle: `Monthly`
   - Next Billing Date: (select date next month)
   - Category: `Entertainment`
4. Click **Save**

**Expected Results:**
- ✅ Subscription appears in list
- ✅ Monthly cost shows `$15.99/mo`
- ✅ Check Supabase **Table Editor > personal_subscriptions**: Record exists
- ✅ `user_id` is a UUID (not email - different from bills!)

---

### Test 6: View Balances
**Goal:** Verify balance calculations from split bills

**Steps:**
1. Navigate to **Balances** page
2. If you created the split bill in Test 4, you should see balances

**Expected Results:**
- ✅ Page loads without errors
- ✅ If split bills exist: Shows "Who owes you" and "Who you owe"
- ✅ If no split bills: Shows "No balances yet"
- ✅ Balance calculations are correct

---

### Test 7: Record a Settlement
**Goal:** Verify settlements feature works

**Steps:**
1. Go to **Balances** page
2. If someone owes you, click **Settle Up**
3. Fill in settlement details
4. Click **Save**

**Expected Results:**
- ✅ Settlement recorded in `settlements` table
- ✅ Balances update correctly
- ✅ Settlement appears in history

---

### Test 8: Row Level Security (RLS)
**Goal:** Verify users can only see their own data

**Steps:**
1. Create a second user account (different email)
2. Log in as second user
3. Check Bills, Subscriptions, Balances pages

**Expected Results:**
- ✅ Second user sees ONLY their own bills
- ✅ Second user sees ONLY their own subscriptions
- ✅ Second user CANNOT see first user's data
- ✅ No unauthorized access errors

---

### Test 9: Authentication Flow
**Goal:** Verify public/private route protection

**Steps:**
1. Log out
2. Try to access `http://localhost:5173/dashboard` directly

**Expected Results:**
- ✅ Automatically redirected to `/login`
- ✅ After login, redirected back to `/dashboard`
- ✅ Logged-in users cannot access `/login` or `/signup` (redirected to dashboard)

---

### Test 10: Password Reset (Optional)
**Goal:** Verify forgot password flow

**Steps:**
1. Go to `http://localhost:5173/forgot-password`
2. Enter your email
3. Click **Send Reset Link**

**Expected Results:**
- ✅ Success message shown
- ✅ Check your email for reset link (requires Supabase email template setup)

**Note:** This requires additional email template configuration in Supabase

---

## 🐛 Common Issues & Solutions

### Issue: "User redirected to /verify-email after signup"
**Cause:** Email confirmation still enabled in Supabase
**Fix:** Go to Supabase Dashboard > Authentication > Providers > Email > UNCHECK "Confirm email"

### Issue: "Cannot read properties of null (reading 'from')"
**Cause:** Supabase client not initialized
**Fix:** Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "New policy violation detected"
**Cause:** RLS policy blocking your request
**Fix:** Check if you ran the complete SQL script with all RLS policies

### Issue: "Bills user_id is email instead of UUID"
**Cause:** This is expected! Bills use email, subscriptions use UUID
**Fix:** No fix needed - this is by design (but noted for future refactoring)

### Issue: "Cannot create bill_participants"
**Cause:** Foreign key constraint or RLS policy issue
**Fix:** Ensure bills table exists and user owns the bill

---

## 📊 Database Verification Queries

Run these in Supabase **SQL Editor** to verify data:

### Check user count:
```sql
SELECT COUNT(*) FROM public.users;
```

### Check bills for a specific user:
```sql
SELECT * FROM public.bills WHERE user_id = 'your-email@example.com';
```

### Check split bill participants:
```sql
SELECT bp.*, b.name as bill_name
FROM public.bill_participants bp
JOIN public.bills b ON bp.bill_id = b.id;
```

### Check subscriptions:
```sql
SELECT * FROM public.personal_subscriptions WHERE status = 'active';
```

### Check settlements:
```sql
SELECT * FROM public.settlements ORDER BY settled_at DESC;
```

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Can sign up new users without email verification
- [ ] Can log in with existing users
- [ ] Can create bills
- [ ] Can create split bills with participants
- [ ] Can add subscriptions
- [ ] Can view balances
- [ ] Can record settlements
- [ ] RLS prevents users from seeing each other's data
- [ ] No console errors during normal usage
- [ ] All database tables have data

---

## 🎉 Success Criteria

Your Supabase setup is **COMPLETE** when:

1. ✅ All 10 functional tests pass
2. ✅ Database verification queries return data
3. ✅ No authentication errors in console
4. ✅ Users can perform all CRUD operations (Create, Read, Update, Delete)
5. ✅ RLS properly isolates user data

---

## 📝 Notes

- **Email Verification:** Disabled for instant access
- **Data Isolation:** RLS ensures users only see their own data
- **Performance:** Indexes created for fast queries
- **Schema Inconsistency:** Bills use email as `user_id`, subscriptions use UUID - this is noted for future improvement

**Happy Testing!** 🚀
