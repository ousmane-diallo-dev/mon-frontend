import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
// Composants globaux
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages publiques
import HomePage from "./pages/HomePage";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CategoryList from "./pages/CategoryList";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Invoice from "./pages/Invoice";
import Services from "./pages/Services";
import Favorites from "./pages/Favorites";
import GoogleCallback from "./pages/GoogleCallback";
import FacebookCallback from "./pages/FacebookCallback";

// Pages utilisateur connecté
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import OrderDetail from "./pages/OrderDetail";

// Pages admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminPayments from "./pages/AdminPayments";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import UserList from "./pages/UserList";

// Page 404 (à créer si elle n'existe pas encore)

const App = () => (
  <div className="w-full min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 w-full bg-gray-50 p-0">
      <Routes>
        {/* 🌐 Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/category" element={<CategoryList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/facebook/callback" element={<FacebookCallback />} />
        {/* 🔐 Routes protégées (utilisateur connecté) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/payment" element={<Payment />} />
        </Route>

        {/* 🛠️ Routes admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/user-list" element={<UserList />} />
        </Route>

        {/* 🚫 Route pour les chemins non trouvés */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
