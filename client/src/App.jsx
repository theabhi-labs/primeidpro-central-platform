import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Public Marketing & Legal Pages
import LandingPage from './pages/public/LandingPage';
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import BuyPage from './pages/public/BuyPage';
import AboutPage from './pages/public/AboutPage';
import DownloadPage from './pages/public/DownloadPage';
import FaqPage from './pages/public/FaqPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';
import CustomerOrderPage from './pages/public/CustomerOrderPage';
import SchoolCardCollectionPage from './pages/public/SchoolCardCollectionPage';
import OrderTrackingPage from './pages/public/OrderTrackingPage';

// CSC Portal Pages
import CscDashboard from './pages/csc/CscDashboard';
import CscJobsQueue from './pages/csc/CscJobsQueue';
import CscWalkInOrder from './pages/csc/CscWalkInOrder';
import CscKioskQr from './pages/csc/CscKioskQr';
import CscDevicePairing from './pages/csc/CscDevicePairing';
import CscWallet from './pages/csc/CscWallet';
import CscServiceSettings from './pages/csc/CscServiceSettings';

// Super Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudios from './pages/admin/AdminStudios';
import AdminDevices from './pages/admin/AdminDevices';
import AdminJobsMonitor from './pages/admin/AdminJobsMonitor';
import AdminLedger from './pages/admin/AdminLedger';
import AdminPricing from './pages/admin/AdminPricing';
import AdminAutoUpdate from './pages/admin/AdminAutoUpdate';
import AdminSettings from './pages/admin/AdminSettings';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layout with Sidebar for CSC & Admin
const PortalLayout = ({ type, children }) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type={type} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};

// Route Guards
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading Prime ID Pro...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070B14]">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Store & Customer Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />

          {/* Customer Self-Service QR Kiosk & Order Wizard */}
          <Route path="/order" element={<CustomerOrderPage />} />
          <Route path="/order/:token" element={<CustomerOrderPage />} />
          <Route path="/kiosk/:slug" element={<CustomerOrderPage />} />
          <Route path="/cards/fill/:token" element={<SchoolCardCollectionPage />} />
          <Route path="/cards/fill" element={<SchoolCardCollectionPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* CSC Studio Operator Protected Routes */}
          <Route
            path="/csc/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscDashboard />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/jobs"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscJobsQueue />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/walk-in"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscWalkInOrder />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/kiosk-qr"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscKioskQr />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/devices"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscDevicePairing />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/wallet"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscWallet />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/csc/settings"
            element={
              <ProtectedRoute allowedRoles={['CSC_OPERATOR', 'CSC', 'SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="csc">
                  <CscServiceSettings />
                </PortalLayout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminDashboard />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/studios"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminStudios />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/devices"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminDevices />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminJobsMonitor />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ledger"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminLedger />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminPricing />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/releases"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminAutoUpdate />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <PortalLayout type="admin">
                  <AdminSettings />
                </PortalLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

