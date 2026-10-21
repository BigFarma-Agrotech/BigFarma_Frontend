import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import Home from './components/landing-page-sections/Home';
// Page Auth
import SignIn from './pages/SignIn';
import SignUp from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import InputOtp from './pages/InputOtp';
import ResetPassword from './pages/ResetPassword';
import RoleSelection from './pages/RoleSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
} from './pages';
import VerifyOtp from './pages/VerifyOtp';
import Success from './pages/Success';
import PaymentSetup from './pages/PaymentSetupModal';
import MarketplacePage from './components/dashboard/marketplace';
import ProductDetail from './components/dashboard/marketplace/product-detail';
import DashboardLayout from './components/dashboard/dashboard-layout';
import GroupBuyPage from './pages/GroupBuyPage';
import CreateGroupModal from './components/dashboard/GroupBuy/CreateGroupModal';
import GroupDetailsPage from './pages/GroupDetailsPage';
import InvestmentPage from "./pages/InvestmentPage";
import WalletPage from "./pages/WalletPage";
import TransactionsPage from "./pages/TransactionsPage";
import MyProductsPage from "./pages/MyProductsPage";
import SettingsPage from "./pages/SettingsPage";



const App = () => {
  return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />
			<Routes>
				<Route path="/" element={<Home />} />
				{/* auth */}
				<Route path="/sign-in" element={<SignIn />} />
				<Route path="/sign-up" element={<SignUp />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/otp" element={<InputOtp />} />
				<Route path="/verify-otp" element={<VerifyOtp />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/role" element={<RoleSelection />} />
				<Route path="/success" element={<Success />} />

				{/* Dashboard */}
				<Route element={<ProtectedRoute />}>
					<Route
						path="/dashboard"
						element={
							<DashboardLayout>
								<DashboardPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/orders"
						element={
							<DashboardLayout>
								<ConsumerOrderPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/marketplace"
						element={
							<DashboardLayout>
								<MarketplacePage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/group-buy"
						element={
							<DashboardLayout>
								<GroupBuyPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/group-buy/create"
						element={
							<DashboardLayout>
								<CreateGroupModal />
							</DashboardLayout>
						}
					/>
					<Route
						path="/marketplace/products/:id"
						element={
							<DashboardLayout>
								<ProductDetail />
							</DashboardLayout>
						}
					/>
					<Route
						path="/cart"
						element={
							<DashboardLayout>
								<CartPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/checkout"
						element={
							<DashboardLayout>
								<CheckoutPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/payment-processing"
						element={
							<DashboardLayout>
								<PaymentProcessingPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/order-confirmation"
						element={
							<DashboardLayout>
								<OrderConfirmationPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/payment"
						element={
							<DashboardLayout>
								<PaymentSetup />
							</DashboardLayout>
						}
					/>

					<Route
						path="/farmer-orders"
						element={
							<DashboardLayout>
								<FarmerOrderPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/farmer-orders/:productId"
						element={
							<DashboardLayout>
								<ProductOrdersPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/farmer-orders/:productId/:orderId"
						element={
							<DashboardLayout>
								<SingleOrderPage />
							</DashboardLayout>
						}
					/>
					<Route
						path="/group-buy/:groupId"
						element={
							<DashboardLayout>
								<GroupDetailsPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/investment"
						element={
							<DashboardLayout>
								<InvestmentPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/wallet"
						element={
							<DashboardLayout>
								<WalletPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/transactions"
						element={
							<DashboardLayout>
								<TransactionsPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/my-products"
						element={
							<DashboardLayout>
								<MyProductsPage />
							</DashboardLayout>
						}
					/>

					<Route
						path="/settings"
						element={
							<DashboardLayout>
								<SettingsPage />
							</DashboardLayout>
						}
					/>
				</Route>
			</Routes>
		</>
	);
};

export default App;
