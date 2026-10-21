import { login } from "@/components/queries/auth/login";
import { toast } from "react-toastify";
// ==================== Images & Icons ====================
import MobileBgSignIn from "../../assets/images/MobileSignup.png";
import DesktopBgSignIn from "../../assets/images/DesktopSignUp.jpg";
import supportIcon from "../../assets/icons/Support_Icon .png";
import { EyeOff, Eye } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// ==================== Data & Config ====================
import { countries } from "../../lib/countries";

// ==================== React & Hooks ====================
import { useState, useContext, useEffect } from "react";
import {
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import useForm from "../../hooks/useForm";
import useIsMobile from "../../hooks/useIsMobile";
import { FocusContext } from "../../context/FocusContext";


// ==================== Components ====================
import Dropdown from "@/components/shared/Dropdown";
import Support from "./Support";

// ==================== Animations ====================

import { motion, AnimatePresence } from "framer-motion";

const SignInForm = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile(); // Tailwind's breakpoint can be passed as a value
  const { setRole } = useContext(FocusContext);

  const { loginData, errors, updateField, updateCountry, handleSubmit, setFieldErrors } =
    useForm();

  // Country
  const handleSelect = (country) => {
    // console.log("selected", country);
    setDropdownOpen(false);
    updateCountry(country);
  };
  // Dropdown ontoggle
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };
  // Focus on input
  const handleInputClick = () => {
    setFocused(!focused);
  };
  const handleUpdateField = (field, value) => {
    updateField(field, value);
  };

  // Where to go after signing in: the page that bounced the user here, else the dashboard
  const redirectTo =
    location.state?.from || searchParams.get("from") || "/dashboard";

  useEffect(() => {
    if (searchParams.get("expired")) {
      toast.info("Your session has expired. Please sign in again.", {
        toastId: "session-expired",
      });
    }
  }, [searchParams]);

  // Already signed in: skip the form
  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleFormSubmit = async (e) => {
    const formData = await handleSubmit(e);
    if (!formData) return;

    setLoading(true);
    const result = await login({
      login: formData.username,
      password: formData.password,
      remember: formData.rememberMe,
    });
    setLoading(false);

    if (!result.isSuccess) {
      const { login: loginError, password: passwordError } = result.fieldErrors;
      setFieldErrors({
        ...(loginError && { username: loginError }),
        ...(passwordError && { password: passwordError }),
      });
      toast.error(result.message);
      return;
    }

    setRole(result.role);
    toast.success(result.message);
    navigate(redirectTo, { replace: true });
  };

  return (
		<section className=" w-full h-screen  flex flex-col lg:flex-row items-center relative lg:overflow-hidden">
			<div className="w-full lg:max-w-[35%] h-full flex items-center justify-center overflow-hidden">
				{/* Background Image */}
				<img
					src={isMobile ? MobileBgSignIn : DesktopBgSignIn}
					alt="Sign In"
					className="w-full h-screen lg:h-full md:h-[51.2rem] object-cover scale-150 md:scale-200 lg:scale-100 transition-transform duration-500"
					style={{ transformOrigin: "center" }}
				/>
			</div>

			{/* Form Container */}
			<div
				className="w-full absolute top-[50%] rounded-t-xl bg-white p-6  md:flex md:items-center md:justify-center 
            lg:relative lg:w-[65%] lg:h-full lg:rounded-tl-lg lg:rounded-bl-lg  
            lg:-ml-1 lg:z-10 lg:top-0">
				<div className=" w-full max-w-2xl flex flex-col  justify-between bg-white py-3 space-y-4">
					<div>
						<span className="text-[32px] font-bold leading-tight">
							Welcome Back!
						</span>
						<p className="text-[18px] font-normal pt-5">
							Sign in to your account to continue
						</p>
					</div>

					{/* Form */}
					<form className="w-full h-auto mt-10" onSubmit={handleFormSubmit}>
						{/* phone no or email */}
						<div>
							<label htmlFor="username" className="font-semibold text-base">
								Phone No or Email
							</label>

							<motion.div
								className="flex items-center gap-2 relative"
								initial={false}
								animate={{ marginLeft: focused ? "10px" : "0px" }}
								transition={{ duration: 0.4 }}>
								<motion.div
									className="relative"
									initial={false}
									animate={{
										opacity: focused ? 0 : 1,
										x: focused ? -50 : 0,
									}}
									transition={{ duration: 0.3 }}>
									<Dropdown
										countries={countries}
										onSelect={handleSelect}
										isOpen={dropdownOpen}
										onToggle={handleDropdownToggle}
									/>
								</motion.div>

								<motion.input
									type="text"
									name="username"
									value={loginData.username}
									onChange={(e) =>
										handleUpdateField("username", e.target.value)
									}
									onClick={handleInputClick}
									placeholder="Your Phone number or Email"
									initial={false}
									animate={{
										width: focused ? 680 : 625,
										marginLeft: focused ? -57 : 0,
									}}
									transition={{ duration: 0.3 }}
									className={`border p-2.5 rounded-lg placeholder:text-base placeholder:text-[#98A2B3] relative z-10 cursor-pointer ${
										errors.username ? "border-red-500" : "border-[#DDD5DD]"
									}`}
								/>
							</motion.div>
							{/* Animation for username error */}
							<AnimatePresence mode="wait">
								{errors.username && (
									<motion.p
										key="password-error"
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.25 }}
										className="text-red-500 text-sm mt-1">
										{errors.username}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* password */}
						<div className="flex flex-col gap-1 mt-4 relative">
							<label htmlFor="password" className="font-semibold text-base">
								Password
							</label>
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								name="password"
								value={loginData.password}
								onChange={(e) => handleUpdateField("password", e.target.value)}
								placeholder="Must be 8 characters"
								className={`w-full max-w-md- p-2.5 rounded-lg placeholder:text-base placeholder:tracking-tight placeholder:text-[#98A2B3] ${
									errors.password ? "border-red-500" : "border-[#DDD5DD]"
								} border`}
							/>
							{/* Password toggle to show/hide */}
							<div
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-5.5 top-10 text-gray-500 cursor-pointer">
								{showPassword ? <Eye /> : <EyeOff />}
							</div>
							{/* Animation for password error */}
							<AnimatePresence mode="wait">
								{errors.password && (
									<motion.p
										key="password-error"
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.25 }}
										className="text-red-500 text-sm mt-1">
										{errors.password}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* Remember me and forgot password */}
						<div className="flex items-center justify-between gap-2 mt-4 text-[#FFA725] text-sm font-medium">
							<div className="inline-flex items-center gap-2">
								<input
									type="checkbox"
									id="remember"
									name="rememberMe"
									checked={loginData.rememberMe}
									onChange={(e) =>
										handleUpdateField("rememberMe", e.target.checked)
									}
									className="w-4 h-4 accent-[#FFA725] mt-1 cursor-pointer"
								/>
								<label htmlFor="remember">Remember me</label>
							</div>
							<span>
								<NavLink to="/forgot-password">Forgot Password?</NavLink>
							</span>
						</div>

						{/* sign in button */}
						<button
							type="submit"
							className="w-full px-6 py-3  rounded-lg mt-4 font-normal text-[22px] bg-[#016130] hover:bg-[#003f1f]  text-white cursor-pointer"
							disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</button>
					</form>

					{/* divider */}
					<div className="mt-8 flex items-center gap-5">
						<div className="flex-1 border-t border-[#00000066] opacity-50"></div>
						{isMobile ? (
							<span className="text-sm font-normal">or sign up with</span>
						) : (
							<span className="text-lg font-medium">or</span>
						)}
						<div className="flex-1 border-t border-[#00000066] opacity-50"></div>
					</div>

					{/* social media buttons */}
					<div className=" flex items-center justify-center gap-7.5 mt-5 font-normal text-base">
						{isMobile ? (
							<div className="flex items-center gap-12.5">
								<div className="w-[48px] h-12 flex items-center justify-center gap-2 bg-white border border-[#3C3C3C] rounded-full shadow-lg">
									<FcGoogle className="text-2xl" />
								</div>
								<div className="w-[48px] h-12 flex items-center justify-center bg gap-2 bg-white border border-[#3C3C3C] rounded-full shadow-lg">
									<FaApple className="text-2xl text-black" />
								</div>
							</div>
						) : (
							<>
								<div className="w-[300px] h-12 flex items-center justify-center gap-2 border border-[#3C3C3C] rounded-lg">
									<FcGoogle className="text-2xl" />
									<button>
										Sign in with <strong>Google</strong>
									</button>
								</div>
								<div className="w-[300px] h-12 flex items-center justify-center gap-2 border border-[#3C3C3C] rounded-lg">
									<FaApple className="text-2xl text-black" />
									<button>
										Sign in with <strong>Apple</strong>
									</button>
								</div>
							</>
						)}
					</div>

					{/* sign up and support */}
					<div className="flex flex-col">
						<p className="font-rubik text-center text-base font-normal mt-5">
							Don't have an account?{" "}
							<NavLink to="/role" className="text-[#FFA725] font-medium">
								Sign Up
							</NavLink>
						</p>
						<div className=" relative self-end">
							<img
								src={supportIcon}
								alt="supportIcon"
								className="w-[40px] h-[40px] self-end"
								onClick={() => setShowSupport(true)}
							/>
							<div className="absolute -bottom-20 -right-40">
								<Support
									show={showSupport}
									onClose={() => setShowSupport(false)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default SignInForm;
