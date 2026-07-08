import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminNavbar from "./components/AdminNavbar";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DesignStudio from "./pages/DesignStudio";
import ProductDetail from "./pages/ProductDetail";
import TrackOrder from "./pages/TrackOrder";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Customize from "./pages/Customize";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminLedger from "./pages/admin/AdminLedger";

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/login" element={<div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow"><Login /></main></div>} />
      <Route path="/customize" element={<PublicLayout><Customize /></PublicLayout>} />
      <Route path="/design-studio" element={<PublicLayout><DesignStudio /></PublicLayout>} />
      <Route path="/my-orders" element={<PublicLayout><MyOrders /></PublicLayout>} />
      <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/track-order" element={<PublicLayout><TrackOrder /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
      <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminLayout><AdminOrders /></AdminLayout></ProtectedAdminRoute>} />
      <Route path="/admin/products" element={<ProtectedAdminRoute><AdminLayout><AdminProducts /></AdminLayout></ProtectedAdminRoute>} />
      <Route path="/admin/ledger" element={<ProtectedAdminRoute><AdminLayout><AdminLedger /></AdminLayout></ProtectedAdminRoute>} />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;