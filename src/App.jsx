import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RouteSeo from "./components/shared/RouteSeo";
import Home from "./components/landing-page-sections/Home";

// Everything except the landing page is loaded on demand, so the first visit
// only downloads the code it needs. The loaders are kept so pages can also be
// fetched ahead of time (see preload), making later clicks instant.
const authPages = {
  SignIn: () => import("./pages/SignIn"),
  SignUp: () => import("./pages/Signup"),
  ForgotPassword: () => import("./pages/ForgotPassword"),
  InputOtp: () => import("./pages/InputOtp"),
  ResetPassword: () => import("./pages/ResetPassword"),
  RoleSelection: () => import("./pages/RoleSelection"),
  VerifyOtp: () => import("./pages/VerifyOtp"),
  Success: () => import("./pages/Success"),
  SupportPage: () => import("./pages/SupportPage"),
};

const dashboardPages = {
  DashboardLayout: () => import("./components/dashboard/dashboard-layout"),
  DashboardPage: () => import("./pages/DashboardPage"),
  ConsumerOrderPage: () => import("./pages/ConsumerOrderPage"),
  CartPage: () => import("./pages/CartPage"),
  CheckoutPage: () => import("./pages/CheckoutPage"),
  PaymentProcessingPage: () => import("./pages/PaymentProcessingPage"),
  OrderConfirmationPage: () => import("./pages/OrderConfirmationPage"),
  FarmerOrderPage: () => import("./pages/FarmerOrderPage"),
  ProductOrdersPage: () => import("./pages/ProductOrdersPage"),
  SingleOrderPage: () => import("./pages/SingleOrderPage"),
  PaymentSetup: () => import("./pages/PaymentSetupModal"),
  MarketplacePage: () => import("./components/dashboard/marketplace"),
  ProductDetail: () => import("./components/dashboard/marketplace/product-detail"),
  GroupBuyPage: () => import("./pages/GroupBuyPage"),
  CreateGroupModal: () => import("./components/dashboard/GroupBuy/CreateGroupModal"),
  GroupDetailsPage: () => import("./pages/GroupDetailsPage"),
  InvestmentPage: () => import("./pages/InvestmentPage"),
  WalletPage: () => import("./pages/WalletPage"),
  TransactionsPage: () => import("./pages/TransactionsPage"),
  MyProductsPage: () => import("./pages/MyProductsPage"),
  SettingsPage: () => import("./pages/SettingsPage"),
};

const { SignIn, SignUp, ForgotPassword, InputOtp, ResetPassword, RoleSelection, VerifyOtp, Success, SupportPage } =
  Object.fromEntries(Object.entries(authPages).map(([name, load]) => [name, lazy(load)]));
const {
  DashboardLayout, DashboardPage, ConsumerOrderPage, CartPage, CheckoutPage, PaymentProcessingPage,
  OrderConfirmationPage, FarmerOrderPage, ProductOrdersPage, SingleOrderPage, PaymentSetup, MarketplacePage,
  ProductDetail, GroupBuyPage, CreateGroupModal, GroupDetailsPage, InvestmentPage, WalletPage, TransactionsPage,
  MyProductsPage, SettingsPage,
} = Object.fromEntries(Object.entries(dashboardPages).map(([name, load]) => [name, lazy(load)]));

// Download pages in the background once the browser is idle, a few at a time,
// so clicking a link later doesn't wait for its code
const preload = (loaders) => {
  const queue = Object.values(loaders);
  const next = () => {
    const batch = queue.splice(0, 3);
    if (!batch.length) return;
    Promise.allSettled(batch.map((load) => load())).then(() => schedule(next));
  };
  const schedule = (fn) =>
    "requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 500);
  schedule(next);
};

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
  { path: "/sign-up/:role", element: <SignUp /> },
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

// One layout for every dashboard page: it stays mounted when moving between
// pages (sidebar, header, notifications and their data aren't rebuilt), and its
// single Suspense boundary lets the current page stay on screen while the next
// one loads instead of flashing a spinner
const DashboardShell = () => {
  useEffect(() => preload(dashboardPages), []);
  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  );
};

const App = () => {
  // Sign-in and sign-up are the likely next pages from the landing page
  useEffect(() => preload(authPages), []);

  return (
    <>
      <RouteSeo />
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
            <Route element={<DashboardShell />}>
              {dashboardRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          </Route>
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
