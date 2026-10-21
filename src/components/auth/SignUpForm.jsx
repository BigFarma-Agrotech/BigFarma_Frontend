import React, { useState, useContext } from "react";
import Dropdown from "@/components/shared/Dropdown";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { countries } from "../../lib/countries";
import { Link, useNavigate } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import useIsMobile from "../../hooks/useIsMobile";
import MobileBg from "../../assets/images/MobileSignup.png";
import DesktopBgSignUp from "../../assets/images/DesktopSignUp.jpg";
import {
	RegisterMutation,
	requestOtp,
} from "@/components/queries/auth/register";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FocusContext } from "@/context/FocusContext";

const SignUpForm = () => {
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const { role } = useContext(FocusContext);

	// --- STATE ---
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agree, setAgree] = useState(false);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [loading, setLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [focused, setFocused] = useState(false);

	// --- HANDLE DROPDOWN ---
	const updateCountry = (country) => {
		setDropdownOpen(false);
		setTouched((prev) => ({ ...prev, country }));
	};

	const handleDropdownToggle = (e) => {
		e?.preventDefault();
		e?.stopPropagation();
		setDropdownOpen(!dropdownOpen);
	};

	// --- VALIDATION ---
	const validateForm = () => {
		const newErrors = {};
		if (!phoneNumber || phoneNumber.length < 10)
			newErrors.phone = "Please enter a valid phone number or email address.";
		if (password.length < 8)
			newErrors.password = "Password must be at least 8 characters!";
		if (password !== confirmPassword)
			newErrors.confirmPassword = "Passwords do not match.";
		if (!agree) newErrors.agree = "You must agree to the terms.";
		return newErrors;
	};

	// --- CHECK IF FORM IS COMPLETE ---
	const isFormValid =
		phoneNumber &&
		phoneNumber.length >= 10 &&
		password.length >= 8 &&
		confirmPassword === password &&
		agree;

	// --- SUBMIT ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		setTouched((prev) => ({
			...prev,
			phone: true,
			password: true,
			confirmPassword: true,
		}));

		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast.error("Please fix the errors in the form.");
			return;
		}

		if (!role) {
			toast.error("Please select a role before signing up.");
			navigate("/role");
			return;
		}

		const identifier = phoneNumber.trim();
		setLoading(true);
		const result = await RegisterMutation({
			identifier,
			password,
			category: role,
		});

		if (!result.isSuccess) {
			setLoading(false);
			// Show the server's validation messages under the matching inputs
			const { email, phone_number, password: passwordError } =
				result.fieldErrors;
			setErrors({
				...((email || phone_number) && { phone: email || phone_number }),
				...(passwordError && { password: passwordError }),
			});
			toast.error(result.message);
			return;
		}

		toast.success(result.message);

		// Send the code the user needs to verify their account
		const otpResult = await requestOtp({
			identifier,
			otp_type: "verification",
		});
		setLoading(false);
		if (!otpResult.isSuccess) {
			toast.error(otpResult.message);
		}

		navigate("/otp", { state: { identifier } });
	};

	// --- UI ---
	return (
		<div className="w-full h-screen flex flex-col lg:flex-row items-center bg-white">
			{/* Left Image */}
			<div className="w-full lg:max-w-[35%] h-full flex items-center justify-center overflow-hidden">
				<img
					src={isMobile ? MobileBg : DesktopBgSignUp}
					alt="Sign Up"
					className="w-full h-screen lg:h-full object-cover"
				/>
			</div>

			{/* Right Form */}
			<div className="w-full absolute top-[50%] rounded-t-xl bg-white p-6 md:flex md:items-center md:justify-center lg:relative lg:w-[65%] lg:h-full lg:rounded-tl-lg lg:rounded-bl-lg lg:-ml-1 lg:z-10 lg:top-0">
				<div className="w-full max-w-2xl flex flex-col justify-between bg-white py-3 space-y-4">
					<h3 className="text-[32px] font-bold">Create an account</h3>
					<p className="text-[18px] font-normal pt-5">
						Enter your details below to create your account and get started
					</p>

					<form
						onSubmit={handleSubmit}
						className="w-full h-auto mt-6 space-y-5">
						{/* Phone/Email */}
						<div>
							<label className="block font-semibold text-base">
								Phone number or Email
							</label>
							<div className="flex items-center gap-2">
								<Dropdown
									countries={countries}
									onSelect={updateCountry}
									isOpen={dropdownOpen}
									onToggle={handleDropdownToggle}
								/>
								<input
									type="text"
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value)}
									onBlur={() =>
										setTouched((prev) => ({ ...prev, phone: true }))
									}
									placeholder="Your Phone number or Email"
									className={`border p-3 rounded-lg w-full placeholder:text-[#98A2B3] ${
										touched.phone && errors.phone
											? "border-red-500"
											: "border-[#DDD5DD]"
									}`}
								/>
							</div>
							{touched.phone && errors.phone && (
								<p className="text-red-600 text-xs mt-1">{errors.phone}</p>
							)}
						</div>

						{/* Password */}
						<div>
							<label className="font-semibold text-base">Password</label>
							<div
								className={`flex items-center rounded-lg px-3 border ${
									touched.password && errors.password
										? "border-red-500"
										: "border-[#DDD5DD]"
								}`}>
								<input
									type={passwordVisible ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Must be 8 characters"
									className="w-full p-3 bg-white focus:outline-none placeholder:text-[#98A2B3]"
								/>
								<div
									className="cursor-pointer text-gray-500"
									onClick={() => setPasswordVisible(!passwordVisible)}>
									{passwordVisible ? <Eye /> : <EyeOff />}
								</div>
							</div>
							{touched.password && errors.password && (
								<p className="text-red-600 text-xs mt-1">{errors.password}</p>
							)}
						</div>

						{/* Confirm Password */}
						<div>
							<label className="font-semibold text-base">
								Confirm Password
							</label>
							<div
								className={`flex items-center rounded-lg px-3 border ${
									touched.confirmPassword && errors.confirmPassword
										? "border-red-500"
										: "border-[#DDD5DD]"
								}`}>
								<input
									type={confirmPasswordVisible ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Repeat password"
									className="w-full p-3 bg-white focus:outline-none placeholder:text-[#98A2B3]"
								/>
								<div
									className="cursor-pointer text-gray-500"
									onClick={() =>
										setConfirmPasswordVisible(!confirmPasswordVisible)
									}>
									{confirmPasswordVisible ? <Eye /> : <EyeOff />}
								</div>
							</div>
							{touched.confirmPassword && errors.confirmPassword && (
								<p className="text-red-600 text-xs mt-1">
									{errors.confirmPassword}
								</p>
							)}
						</div>

						{/* Terms & Conditions */}
						<div className="flex items-start gap-2 mt-5">
							<input
								type="checkbox"
								checked={agree}
								onChange={(e) => setAgree(e.target.checked)}
								className="w-4 h-4 accent-[#FFA725] mt-1 cursor-pointer"
							/>
							<label className="text-gray-500 text-sm">
								By signing up, you agree to our{" "}
								<a
									href="/terms"
									className="text-[#FFA725]"
									target="_blank"
									rel="noopener noreferrer">
									Terms & Conditions
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="text-[#FFA725]"
									target="_blank"
									rel="noopener noreferrer">
									Privacy Policy
								</a>
								.
							</label>
						</div>

						{/* Sign Up Button */}
						<button
							type="submit"
							disabled={!isFormValid || loading}
							className={`w-full h-12 cursor-pointer rounded-lg mt-4 font-medium text-[20px] transition-all duration-300 ${
								isFormValid
									? "bg-[#016130] text-white"
									: "bg-[#DDD5DD] text-[#3C3C3C]"
							}`}>
							{loading ? "Signing up..." : "Sign Up"}
						</button>
					</form>

					{/* Divider */}
					<div className="mt-3 flex items-center gap-5">
						<hr className="flex-grow border-gray-300" />
						<span className="text-gray-400 text-xs">Or</span>
						<hr className="flex-grow border-gray-300" />
					</div>

					{/* Social Login */}
					<div className="flex justify-center items-center gap-7 font-normal text-base">
						<button
							type="button"
							className="w-[200px] h-12 flex items-center justify-center gap-3 border border-[#3C3C3C] rounded-lg">
							<FcGoogle className="text-lg mr-2" />
							<span>Google</span>
						</button>
						<button
							type="button"
							className="w-[200px] h-12 flex items-center justify-center gap-3 border border-[#3C3C3C] rounded-lg">
							<FaApple className="text-lg mr-2" />
							<span>Apple</span>
						</button>
					</div>

					<p className="text-center text-base font-normal mt-5">
						Already have an account?{" "}
						<Link to="/sign-in" className="text-[#FFA725] font-medium">
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SignUpForm;
