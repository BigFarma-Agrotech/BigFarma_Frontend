import { useState, useContext } from "react";
import {
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "@/components/queries/auth/login";
import Button from "@/components/shared/Button";
import useForm from "@/hooks/useForm";
import { FocusContext } from "@/context/FocusContext";
import { isAuthenticated } from "@/lib/auth";
import {
  AuthDivider,
  AuthHeader,
  AuthSplitLayout,
  CountryInput,
  FormField,
  PasswordInput,
  SocialButtons,
  SupportButton,
} from "./AuthUI";
import { linkClass, primaryButtonClass } from "./authStyles";

// Only follow in-app paths, never an absolute or protocol-relative URL
const safeRedirect = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
    ? path
    : null;

const SignInForm = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setRole } = useContext(FocusContext);

  const {
    loginData,
    errors,
    updateField,
    updateCountry,
    validateField,
    validateForm,
    setFieldErrors,
  } = useForm();

  // Where to go after signing in: the page that bounced the user here, else the dashboard
  const redirectTo =
    safeRedirect(location.state?.from) ||
    safeRedirect(searchParams.get("from")) ||
    "/dashboard";

  const sessionExpired = Boolean(searchParams.get("expired"));

  // Already signed in: skip the form
  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSelect = (country) => {
    setDropdownOpen(false);
    updateCountry(country);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    const result = await login({
      login: loginData.username,
      password: loginData.password,
      remember: loginData.rememberMe,
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
    <AuthSplitLayout imageAlt="Sign in">
      <AuthHeader
        title="Welcome back!"
        subtitle="Sign in to your account to continue"
      />

      {sessionExpired && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-secondary-light px-4 py-2 text-sm text-secondary-dark"
        >
          Your session has expired. Please sign in again.
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleFormSubmit} noValidate>
        <FormField
          label="Phone number or Email"
          htmlFor="username"
          error={errors.username}
        >
          <CountryInput
            id="username"
            name="username"
            autoComplete="username"
            value={loginData.username}
            onChange={(e) => updateField("username", e.target.value)}
            onBlur={() => validateField("username")}
            aria-invalid={Boolean(errors.username)}
            placeholder="Your phone number or email"
            dropdownOpen={dropdownOpen}
            onToggle={handleDropdownToggle}
            onSelect={handleSelect}
            hasError={Boolean(errors.username)}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={loginData.password}
            onChange={(e) => updateField("password", e.target.value)}
            onBlur={() => validateField("password")}
            aria-invalid={Boolean(errors.password)}
            placeholder="Must be 8 characters"
            hasError={Boolean(errors.password)}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <label
            htmlFor="remember"
            className="inline-flex cursor-pointer items-center gap-2 font-medium text-secondary"
          >
            <input
              type="checkbox"
              id="remember"
              name="rememberMe"
              checked={loginData.rememberMe}
              onChange={(e) => updateField("rememberMe", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-secondary"
            />
            Remember me
          </label>
          <NavLink to="/forgot-password" className={linkClass}>
            Forgot password?
          </NavLink>
        </div>

        <Button type="submit" className={primaryButtonClass} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 space-y-5">
        <AuthDivider />
        <SocialButtons prefix="Sign in with" />
      </div>

      <p className="mt-8 text-center text-base text-text-neutral">
        Don&apos;t have an account?{" "}
        <NavLink to="/role" className={linkClass}>
          Sign Up
        </NavLink>
      </p>

      <SupportButton />
    </AuthSplitLayout>
  );
};

export default SignInForm;
