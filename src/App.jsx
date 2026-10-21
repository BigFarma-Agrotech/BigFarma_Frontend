import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Home from "./components/landing-page-sections/Home";
// Auth pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import InputOtp from "./pages/InputOtp";
import ResetPassword from "./pages/ResetPassword";
import RoleSelection from "./pages/RoleSelection";
import VerifyOtp from "./pages/VerifyOtp";
import Success from "./pages/Success";
import SupportPage from "./pages/SupportPage";

import {
  DashboardPage,
  ConsumerOrderPage,
  CartPage,
  CheckoutPage,
  PaymentProcessingPage,
  OrderConfirmationPage,
  FarmerOrderPage,
  ProductOrdersPage,
  SingleOrderPage,
} from "./pages";
import PaymentSetup from "./pages/PaymentSetupModal";
import MarketplacePage from "./components/dashboard/marketplace";
import ProductDetail from "./components/dashboard/marketplace/product-detail";
import DashboardLayout from "./components/dashboard/dashboard-layout";
import GroupBuyPage from "./pages/GroupBuyPage";
import CreateGroupModal from "./components/dashboard/GroupBuy/CreateGroupModal";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import InvestmentPage from "./pages/InvestmentPage";
import WalletPage from "./pages/WalletPage";
import TransactionsPage from "./pages/TransactionsPage";
import MyProductsPage from "./pages/MyProductsPage";
import SettingsPage from "./pages/SettingsPage";

const authRoutes = [
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/otp", element: <InputOtp /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/role", element: <RoleSelection /> },
  { path: "/success", element: <Success /> },
  { path: "/support", element: <SupportPage /> },
];

const dashboardRoutes = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/orders", element: <ConsumerOrderPage /> },
  { path: "/marketplace", element: <MarketplacePage /> },
  { path: "/marketplace/products/:id", element: <ProductDetail /> },
  { path: "/group-buy", element: <GroupBuyPage /> },
  { path: "/group-buy/create", element: <CreateGroupModal /> },
  { path: "/group-buy/:groupId", element: <GroupDetailsPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/payment-processing", element: <PaymentProcessingPage /> },
  { path: "/order-confirmation", element: <OrderConfirmationPage /> },
  { path: "/payment", element: <PaymentSetup /> },
  { path: "/farmer-orders", element: <FarmerOrderPage /> },
  { path: "/farmer-orders/:productId", element: <ProductOrdersPage /> },
  { path: "/farmer-orders/:productId/:orderId", element: <SingleOrderPage /> },
  { path: "/investment", element: <InvestmentPage /> },
  { path: "/wallet", element: <WalletPage /> },
  { path: "/transactions", element: <TransactionsPage /> },
  { path: "/my-products", element: <MyProductsPage /> },
  { path: "/settings", element: <SettingsPage /> },
];

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />

          {authRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {dashboardRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<DashboardLayout>{element}</DashboardLayout>}
            />
          ))}
        </Routes>
      </ErrorBoundary>
    </>
  );
};

export default App;
