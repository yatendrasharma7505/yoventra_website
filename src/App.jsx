import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { InfluencerAuthProvider } from './influencer/AuthContext';
import { InfluencerCoupon } from './influencer/pages/Coupon';
import { InfluencerDashboard } from './influencer/pages/Dashboard';
import { DashboardLayout } from './influencer/pages/DashboardLayout';
import { InfluencerEarnings } from './influencer/pages/Earnings';
import { InfluencerLogin } from './influencer/pages/Login';
import { InfluencerOrders } from './influencer/pages/Orders';
import { InfluencerPayouts } from './influencer/pages/Payouts';
import { InfluencerProfile } from './influencer/pages/Profile';
import { InfluencerRegister } from './influencer/pages/Register';
import { InfluencerDashboardTerms, InfluencerPublicTerms } from './influencer/pages/Terms';
import { DeleteAccount } from './pages/DeleteAccount';
import { Home } from './pages/Home';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// The influencer portal has its own chrome (auth pages / dashboard sidebar)
// instead of the marketing header and footer.
function InfluencerPortal() {
  return (
    <InfluencerAuthProvider>
      <div className="bg-background text-foreground">
        <Outlet />
      </div>
    </InfluencerAuthProvider>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
        </Route>

        <Route path="/influencer" element={<InfluencerPortal />}>
          <Route index element={<Navigate to="/influencer/dashboard" replace />} />
          <Route path="login" element={<InfluencerLogin />} />
          <Route path="register" element={<InfluencerRegister />} />
          <Route path="terms" element={<InfluencerPublicTerms />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<InfluencerDashboard />} />
            <Route path="coupon" element={<InfluencerCoupon />} />
            <Route path="orders" element={<InfluencerOrders />} />
            <Route path="earnings" element={<InfluencerEarnings />} />
            <Route path="payouts" element={<InfluencerPayouts />} />
            <Route path="profile" element={<InfluencerProfile />} />
            <Route path="dashboard-terms" element={<InfluencerDashboardTerms />} />
          </Route>
          <Route path="*" element={<Navigate to="/influencer/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}
