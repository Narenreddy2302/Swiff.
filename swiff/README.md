# Swiff - Personal Finance & Bill Splitting App

A Splitwise-inspired personal finance application for managing bills, splitting expenses with friends and family, and tracking subscriptions. Built with React, Firebase, and TailwindCSS with Tesla-inspired minimalist design.

## Features

### MVP (Current Phase)
- User authentication (Email/Password + Google OAuth)
- Dashboard with expense overview
- Bill management and splitting
- Personal subscription tracking
- Group expense management
- Real-time balance calculations

### Coming Soon
- Receipt uploads with OCR
- Expense analytics and charts
- Payment integrations (Venmo/PayPal)
- Recurring bill automation
- Mobile app (React Native)
- Currency conversion

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS (Tesla-inspired design system)
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore (Database)
  - Cloud Functions (Background tasks)
  - Hosting
- **State Management**: React Query + Context API
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6

## Project Structure

```
swiff/
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   └── layout/          # Layout components
│   ├── features/            # Feature-based modules
│   │   ├── auth/
│   │   ├── bills/
│   │   ├── subscriptions/
│   │   ├── groups/
│   │   └── dashboard/
│   ├── services/            # API & Firebase services
│   │   ├── firebase/
│   │   ├── api/
│   │   └── utils/
│   ├── routes/              # Route definitions
│   ├── hooks/               # Custom hooks
│   ├── context/             # Global context
│   ├── utils/               # Helper functions
│   └── styles/              # Global styles
├── public/
├── .env.example             # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd swiff
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)

   b. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable "Email/Password"
      - Enable "Google"

   c. Create a Firestore database:
      - Go to Firestore Database
      - Create database (start in test mode for development)

   d. Get your Firebase configuration:
      - Go to Project Settings > General
      - Scroll down to "Your apps" section
      - Click the web icon (</>)
      - Copy the configuration

4. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Firebase Security Rules

Before deploying to production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);

      match /personalSubscriptions/{subscriptionId} {
        allow read, write: if isOwner(userId);
      }
    }

    // Bills - users can read if they're a participant
    match /bills/{billId} {
      allow read: if isAuthenticated() &&
                  request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
                            request.auth.uid == resource.data.createdBy;
    }

    // Additional rules for groups, shared subscriptions, etc.
    // See documentation for complete security rules
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

### Colors (Tesla-inspired)

```css
Primary: #000000 (Black), #FFFFFF (White)
Accent: #E82127 (Red), #3457DC (Blue)
Status: Success (#28A745), Warning (#FFC107), Danger (#DC3545)
```

### Typography

- Font: Inter, SF Pro Display, System fonts
- Sizes: 12px - 36px scale
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components

All components follow Tesla's minimalist design philosophy:
- Clean interfaces with generous white space
- Subtle animations and transitions
- High contrast for accessibility
- Simple, recognizable iconography

## Database Schema

### Collections

- **users** - User profiles and preferences
  - **personalSubscriptions** (subcollection) - Personal subscriptions
- **bills** - Individual bills and expenses
- **groups** - Group information
  - **expenses** (subcollection) - Group expenses
- **sharedSubscriptions** - Subscriptions shared between users
- **settlements** - Payment records
- **userBalances** - Pre-calculated balances between users

## Development Roadmap

### Phase 1: Foundation ✅
- Project setup
- Authentication system
- Basic UI components
- Dashboard skeleton

### Phase 2: Core Features (Weeks 3-4)
- Bill creation and management
- Simple bill splitting
- Personal subscription tracking
- Balance calculations

### Phase 3: Social Features (Weeks 5-6)
- Group management
- Advanced splitting options
- Shared subscriptions
- Settlement tracking

### Phase 4: Polish & Launch (Weeks 7-8)
- Notifications
- UI animations
- Performance optimization
- Security hardening
- Production deployment

## Contributing

This is currently a private MVP project. Contribution guidelines will be added once the project is open-sourced.

## License

All rights reserved. This project is currently private and not licensed for public use.

## Support

For issues and questions, please contact the development team.

## Acknowledgments

- Design inspiration: [Tesla](https://www.tesla.com)
- Feature inspiration: [Splitwise](https://www.splitwise.com)
- Built with [React](https://react.dev) and [Firebase](https://firebase.google.com)
