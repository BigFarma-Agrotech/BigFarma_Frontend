import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { passwordReset } from "@/components/queries/auth/passwordReset";
import Button from "@/components/shared/Button";
import {
  AuthHeader,
  AuthPage,
  BackLink,
  FormField,
  PasswordInput,
  SupportButton,
} from "./AuthUI";
import { primaryButtonClass } from "./authStyles";

const ResetPasswordForm = () => {
  const location = useLocation();
  // Set by VerifyOtpForm once the reset code has been verified
  const identifier = location.state?.identifier;
  const verified = location.state?.verified;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [serverErrors, setServerErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Only reachable after verifying a reset code
  if (!identifier || !verified) {
    return <Navigate to="/forgot-password" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      password: true,
      confirmPassword: true,
    });

    if (loading) return;
    if (Object.keys(validateForm()).length > 0) return;

    setServerErrors({});
    setLoading(true);
    const result = await passwordReset({ identifier, new_password: password });
    setLoading(false);

    if (!result.isSuccess) {
      const { new_password } = result.fieldErrors;
      if (new_password) setServerErrors({ password: new_password });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    navigate("/success", { replace: true });
  };

  // Derived from the current values; shown once a field is touched.
  // A server message for the password shows until the user edits it.
  const errors = validateForm();
  const passwordError =
    (touched.password && errors.password) || serverErrors.password;
  const confirmError = touched.confirmPassword && errors.confirmPassword;

  return (
    <AuthPage>
      <BackLink fallback="/forgot-password" />

      <AuthHeader
        className="mt-6"
        title="Set a new password"
        subtitle="Create a new password. Ensure it differs from previous ones for security."
      />

      <form className="mt-8 space-y-5" onSubmit={handleFormSubmit} noValidate>
        <FormField label="Password" htmlFor="password" error={passwordError}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={password}
            placeholder="Must be 8 characters"
            onChange={(e) => {
              setPassword(e.target.value);
              if (serverErrors.password) setServerErrors({});
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            hasError={Boolean(passwordError)}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={confirmError}
        >
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            placeholder="Repeat password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, confirmPassword: true }))
            }
            hasError={Boolean(confirmError)}
          />
        </FormField>

        <Button
          type="submit"
          className={`${primaryButtonClass} mt-1`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <SupportButton />
    </AuthPage>
  );
};

export default ResetPasswordForm;
