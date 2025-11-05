# Swiff

**Split Expenses Effortlessly** - A modern expense sharing and bill splitting application with Tesla-inspired design.

## Overview

Swiff is a Splitwise-like application that helps you track shared expenses, manage groups, and settle debts with friends and family. Built with a clean, minimalist design inspired by Tesla's website aesthetic.

## Features

- **Dashboard**: View your expense overview, balances, and recent activity at a glance
- **Add Expenses**: Quickly add and split expenses with your groups
- **Group Management**: Create and manage groups for different occasions (trips, households, etc.)
- **Balance Tracking**: See who owes whom and settle up easily
- **Activity Feed**: Track all recent activity across your groups

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Design**: Tesla-inspired minimalist aesthetic

## Design Philosophy

Inspired by Tesla's website design, Swiff features:

- **Clean Typography**: Using Helvetica Neue and Gotham-style fonts
- **Minimalist Layout**: Lots of white space and clear visual hierarchy
- **Bold Colors**: Black (#181B21), White (#FFFFFF), and Red (#E82127) accent
- **Simple Navigation**: Clear call-to-actions and intuitive user flow
- **Modern Aesthetic**: Sleek, high-contrast design elements

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Swiff.
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Swiff/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── groups/           # Groups management page
│   ├── activity/         # Activity feed page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── Button.tsx        # Button component
│   ├── Card.tsx          # Card component
│   └── Header.tsx        # Header/Navigation
├── types/                # TypeScript types
│   └── index.ts          # Shared type definitions
└── tailwind.config.ts    # Tailwind configuration
```

## Current Status

This is a **frontend prototype** with mock data. Features demonstrated:

- ✅ Responsive Tesla-inspired UI
- ✅ Dashboard with balance overview
- ✅ Expense management interface
- ✅ Group creation and management
- ✅ Activity feed
- ⏳ Backend integration (planned)
- ⏳ User authentication (planned)
- ⏳ Real database (planned)

## Future Enhancements

- User authentication and authorization
- Database integration (PostgreSQL/Prisma)
- Real-time updates
- Payment integration
- Mobile app version
- Email notifications
- Receipt upload and OCR

## License

MIT License - see LICENSE file for details

## Author

Narenreddy2302
