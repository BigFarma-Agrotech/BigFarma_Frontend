import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const email = location.state?.email;
  const code = location.state?.code;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    if (Object.keys(validateForm()).length > 0) {
      return;
    } else if (!email || !code) {
      toast.error(
        "Missing email or OTP code. Please restart the password reset process.",
      );
      navigate("/forgot-password");
    } else {
      setLoading(true);
      const payload = {
        email,
        phone: "",
        medium: "email",
        code,
        new_password: password,
      };
      try {
        const result = await passwordReset(payload);
        if (result.isSuccess) {
          toast.success(result.message || "Password updated successfully!");
          navigate("/success", { replace: true });
        } else {
          toast.error(result.message || "Failed to update password.");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to update password.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Derived from the current values; shown once a field is touched.
  const errors = validateForm();
  const passwordError = touched.password && errors.password;
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
            onChange={(e) => setPassword(e.target.value)}
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
