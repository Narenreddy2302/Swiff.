# Swiff - Quick Start Guide

## Immediate Next Steps

You have successfully completed **Phase 1: Foundation**! Here's what to do next:

### 1. Set Up Firebase (5-10 minutes)

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: "Swiff" (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click "Create Project"

#### Enable Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get Started"
3. Click "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Select a support email
   - Click "Save"

#### Create Firestore Database
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location (select closest to your users)
5. Click "Enable"

#### Get Firebase Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`)
5. Register app:
   - App nickname: "Swiff Web"
   - Don't check "Firebase Hosting" (we'll do this later)
   - Click "Register app"
6. Copy the `firebaseConfig` object

#### Add Config to Your App
1. Open `.env.local` in your code editor
2. Paste your Firebase values:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### 2. Run the Application

```bash
# Make sure you're in the swiff directory
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Test Authentication

1. Click "Sign up" to create a new account
2. Fill in the form:
   - Full Name: Your name
   - Email: your-email@example.com
   - Password: (at least 8 characters)
   - Confirm Password: (same as above)
3. Click "Create Account"
4. You should be redirected to the Dashboard!

Try logging out and logging back in to test the login flow.

### 4. Test Google Sign-In

1. Log out if you're logged in
2. On the login page, click "Sign in with Google"
3. Select your Google account
4. You should be redirected to the Dashboard

---

## Current Features Working

- ✅ User registration with email/password
- ✅ Login with email/password
- ✅ Google OAuth sign-in
- ✅ Protected routes (can't access dashboard without login)
- ✅ Basic dashboard with user greeting
- ✅ Logout functionality

---

## What's Built So Far

### Architecture
- Feature-based folder structure
- React Query for server state
- Context API for auth state
- Protected and public routes
- Firebase integration

### UI Components
- Button (primary, secondary, ghost, danger variants)
- Card (with optional hover effect)
- Input (with validation states)
- Modal (responsive with animations)
- Loader (full-screen and inline)

### Design System
- Tesla-inspired color palette
- Custom Tailwind config
- Smooth animations with Framer Motion
- Responsive layouts

---

## Next Development Steps (Phase 2)

### Week 3-4: Core Features

#### 1. Bill Management Service
Create `src/services/api/billsService.js`:
- `createBill()` - Create new bill
- `getBills()` - Fetch user's bills
- `getBillById()` - Get bill details
- `updateBill()` - Edit bill
- `deleteBill()` - Remove bill

#### 2. Bill Components
- `BillForm.jsx` - Form to create/edit bills
- `BillCard.jsx` - Display bill summary
- `BillList.jsx` - List all bills
- `BillDetail.jsx` - View bill details
- `SplitCalculator.jsx` - Calculate splits

#### 3. Subscription Management
Create similar structure for subscriptions:
- Service layer (`subscriptionsService.js`)
- Components (Form, Card, List, Calendar)
- Pages (List view, Detail view)

#### 4. Dashboard Enhancements
- Fetch real balance data from Firestore
- Display recent bills
- Show upcoming subscription renewals
- Quick action buttons that work

---

## Development Tips

### Hot Module Replacement (HMR)
Vite supports HMR, so your changes will appear instantly without full page reload.

### Component Development
1. Build components in isolation first
2. Test with different props
3. Add to relevant feature folder
4. Export from feature index

### State Management Pattern
```javascript
// For server state (Firebase data)
import { useQuery } from '@tanstack/react-query';

// For local/UI state
import { useState } from 'react';

// For global app state
import { useAuth } from './features/auth/hooks/useAuth';
```

### File Naming Conventions
- Components: PascalCase (`BillCard.jsx`)
- Utilities: camelCase (`formatters.js`)
- Constants: UPPER_SNAKE_CASE in files
- Styles: kebab-case (if separate CSS files)

### Git Workflow (Recommended)
```bash
# Create feature branch
git checkout -b feature/bill-management

# Make changes and commit frequently
git add .
git commit -m "Add bill creation form"

# Push to remote
git push origin feature/bill-management

# Merge to main when complete
```

---

## Troubleshooting

### Firebase Errors

**"Firebase: Error (auth/configuration-not-found)"**
- Check that `.env.local` exists and has correct values
- Restart dev server after changing .env files

**"Firebase: Error (auth/unauthorized-domain)"**
- Go to Firebase Console > Authentication > Settings
- Add `localhost` to authorized domains

### Build Errors

**"Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Check import paths are correct

**Tailwind classes not working**
- Ensure `tailwind.config.js` includes correct content paths
- Check that `index.css` imports Tailwind directives

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Linting
npm run lint             # Check for errors

# Dependencies
npm install package-name         # Add new dependency
npm install -D package-name      # Add dev dependency
npm update                       # Update all packages
```

---

## Resources

- [React Documentation](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [React Query Docs](https://tanstack.com/query)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## Questions?

Refer to the main [README.md](README.md) for detailed documentation.

Happy coding! 🚀
