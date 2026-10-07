import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// E-Commerce Pages
import { Home } from './pages/Home';
import { CategoryProducts } from './pages/CategoryProducts';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { MyOrders } from './pages/MyOrders';
import { SavedAddresses } from './pages/SavedAddresses';
import { Wishlist } from './pages/Wishlist';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { DeleteAccount } from './pages/DeleteAccount';

// Influencer Portal Pages
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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

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
    <AuthProvider>
      <DeliveryProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Routes>
              {/* Main E-Commerce Store */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/categories/:categoryId" element={<CategoryProducts />} />
                <Route path="/price/:range" element={<CategoryProducts />} />
                <Route path="/search" element={<CategoryProducts />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/account" element={<MyOrders />} />
                <Route path="/account/orders" element={<MyOrders />} />
                <Route path="/account/orders/:orderId" element={<MyOrders />} />
                <Route path="/account/addresses" element={<SavedAddresses />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
              </Route>

              {/* Influencer Portal */}
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </DeliveryProvider>
    </AuthProvider>
  );
}
