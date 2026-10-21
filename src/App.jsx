import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./components/landing-page-sections/Home";

// Everything except the landing page is loaded on demand, so the first visit
// only downloads the code it needs.
// Auth pages
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const InputOtp = lazy(() => import("./pages/InputOtp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const Success = lazy(() => import("./pages/Success"));
const SupportPage = lazy(() => import("./pages/SupportPage"));

// Dashboard pages
const DashboardLayout = lazy(() => import("./components/dashboard/dashboard-layout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ConsumerOrderPage = lazy(() => import("./pages/ConsumerOrderPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PaymentProcessingPage = lazy(() => import("./pages/PaymentProcessingPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const FarmerOrderPage = lazy(() => import("./pages/FarmerOrderPage"));
const ProductOrdersPage = lazy(() => import("./pages/ProductOrdersPage"));
const SingleOrderPage = lazy(() => import("./pages/SingleOrderPage"));
const PaymentSetup = lazy(() => import("./pages/PaymentSetupModal"));
const MarketplacePage = lazy(() => import("./components/dashboard/marketplace"));
const ProductDetail = lazy(() => import("./components/dashboard/marketplace/product-detail"));
const GroupBuyPage = lazy(() => import("./pages/GroupBuyPage"));
const CreateGroupModal = lazy(() => import("./components/dashboard/GroupBuy/CreateGroupModal"));
const GroupDetailsPage = lazy(() => import("./pages/GroupDetailsPage"));
const InvestmentPage = lazy(() => import("./pages/InvestmentPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const MyProductsPage = lazy(() => import("./pages/MyProductsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Plain CSS spinner so the fallback doesn't pull animation libraries into the
// initial bundle
const PageLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary-light" />
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {authRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Dashboard: requires a signed-in user */}
          <Route element={<ProtectedRoute />}>
            {dashboardRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <DashboardLayout>
                    {/* Inner boundary keeps the sidebar visible while a page loads */}
                    <Suspense fallback={<PageLoader />}>{element}</Suspense>
                  </DashboardLayout>
                }
              />
            ))}
          </Route>
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
