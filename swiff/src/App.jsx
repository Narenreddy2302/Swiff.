import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

// Auth Pages
import Login from './features/auth/pages/Login';
import Signup from './features/auth/pages/Signup';
import ForgotPassword from './features/auth/pages/ForgotPassword';

// App Pages
import Dashboard from './features/dashboard/pages/Dashboard';
import BillsPage from './features/bills/pages/BillsPage';
import BillDetail from './features/bills/pages/BillDetail';
import BalancesPage from './features/bills/pages/BalancesPage';
import SubscriptionsPage from './features/subscriptions/pages/SubscriptionsPage';
import GroupsPage from './features/groups/pages/GroupsPage';
import GroupDetail from './features/groups/pages/GroupDetail';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Redirect to dashboard if authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/bills"
              element={
                <PrivateRoute>
                  <BillsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/bills/:id"
              element={
                <PrivateRoute>
                  <BillDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/balances"
              element={
                <PrivateRoute>
                  <BalancesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <PrivateRoute>
                  <SubscriptionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <GroupsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <PrivateRoute>
                  <GroupDetail />
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
