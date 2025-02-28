import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UsersPage from './components/UsersPage';
import ProductsPage from './components/ProductsPage';
import OrdersPage from './components/OrdersPage';
import TopUpRequestsPage from './components/TopUpRequestsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/user/UserDashboard';
import UserProducts from './components/user/UserProducts';
import UserOrders from './components/user/UserOrders';
import UserSettings from './components/user/UserSettings';
import { initializeData } from './utils/dataInitializer';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Initialize demo data if not exists
    initializeData();
    setIsLoading(false);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthProvider>
      <NotificationsProvider>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <main className="p-6">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/users" element={<UsersPage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/topup" element={<TopUpRequestsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* User routes */}
            <Route path="/user/*" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <Routes>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/products" element={<UserProducts />} />
                    <Route path="/orders" element={<UserOrders />} />
                    <Route path="/settings" element={<UserSettings />} />
                    <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            } />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
