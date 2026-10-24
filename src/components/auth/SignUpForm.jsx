import { useState, useContext, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  RegisterMutation,
  requestOtp,
} from "@/components/queries/auth/register";
import Button from "@/components/shared/Button";
import { FocusContext } from "@/context/FocusContext";
import {
  AuthDivider,
  AuthHeader,
  AuthSplitLayout,
  CountryInput,
  FieldError,
  FormField,
  PasswordInput,
  SocialButtons,
} from "./AuthUI";
import { linkClass, primaryButtonClass } from "./authStyles";

const ROLES = ["farmer", "consumer"];

const SignUpForm = () => {
  const navigate = useNavigate();
  const { role: roleParam } = useParams();
  const { role: savedRole, setRole } = useContext(FocusContext);
  // /sign-up/farmer and /sign-up/consumer set the role from the URL so they
  // can be linked to (and indexed) directly
  const role = ROLES.includes(roleParam) ? roleParam : savedRole;

  useEffect(() => {
    if (ROLES.includes(roleParam) && roleParam !== savedRole) setRole(roleParam);
  }, [roleParam, savedRole, setRole]);

  // --- STATE ---
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  // Errors are derived from the current values and only shown once the
  // corresponding field has been touched (blurred) or a submit was attempted.
  // Server validation messages show until the user edits that field.
  const errors = validateForm();
  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const fieldError = (field) =>
    (touched[field] ? errors[field] : undefined) || serverErrors[field];
  const clearServerError = (field) => {
    if (serverErrors[field]) {
      setServerErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setTouched((prev) => ({
      ...prev,
      phone: true,
      password: true,
      confirmPassword: true,
      agree: true,
    }));

    if (Object.keys(errors).length > 0) {
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
      setServerErrors({
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

  if (roleParam && !ROLES.includes(roleParam)) {
    return <Navigate to="/role" replace />;
  }

  // --- UI ---
  return (
    <AuthSplitLayout imageAlt="Sign up">
      <AuthHeader
        title={
          role === "farmer"
            ? "Create a farmer account"
            : role === "consumer"
              ? "Create a consumer account"
              : "Create an account"
        }
        subtitle="Enter your details below to create your account and get started"
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormField
          label="Phone number or Email"
          htmlFor="signup-username"
          error={fieldError("phone")}
        >
          <CountryInput
            id="signup-username"
            name="username"
            autoComplete="username"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              clearServerError("phone");
            }}
            onBlur={() => markTouched("phone")}
            placeholder="Your phone number or email"
            dropdownOpen={dropdownOpen}
            onToggle={handleDropdownToggle}
            onSelect={updateCountry}
            hasError={Boolean(fieldError("phone"))}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="signup-password"
          error={fieldError("password")}
        >
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearServerError("password");
            }}
            onBlur={() => markTouched("password")}
            placeholder="Must be 8 characters"
            hasError={Boolean(fieldError("password"))}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="signup-confirm-password"
          error={fieldError("confirmPassword")}
        >
          <PasswordInput
            id="signup-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => markTouched("confirmPassword")}
            placeholder="Repeat password"
            hasError={Boolean(fieldError("confirmPassword"))}
          />
        </FormField>

        {/* Terms & Conditions */}
        <div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                markTouched("agree");
              }}
              aria-invalid={Boolean(fieldError("agree"))}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-secondary"
            />
            <label htmlFor="agree" className="text-sm text-grey-300">
              By signing up, you agree to our{" "}
              <a
                href="/terms"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>
          <FieldError>{fieldError("agree")}</FieldError>
        </div>

        <Button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-8 space-y-5">
        <AuthDivider />
        <SocialButtons />
      </div>

      <p className="mt-8 text-center text-base text-text-neutral">
        Already have an account?{" "}
        <Link to="/sign-in" className={linkClass}>
          Sign In
        </Link>
      </p>
    </AuthSplitLayout>
  );
};

export default SignUpForm;
