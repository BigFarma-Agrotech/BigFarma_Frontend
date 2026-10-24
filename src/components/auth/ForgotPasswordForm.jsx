import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPasswordRequest } from "@/components/queries/auth/forgotPasswordRequest";
import Button from "@/components/shared/Button";
import {
  AuthHeader,
  AuthPage,
  BackLink,
  FormField,
  SupportButton,
} from "./AuthUI";
import { cn } from "@/lib/utils";
import { inputClass, inputErrorClass, primaryButtonClass } from "./authStyles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email only for now, matching sign-in
  const validate = (value = email) =>
    EMAIL_RE.test(value.trim()) ? {} : { email: "Please enter a valid email address." };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setTouched(true);
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const identifier = email.trim();
    setErrors({});
    setLoading(true);
    const result = await forgotPasswordRequest({ identifier });
    setLoading(false);

    if (!result.isSuccess) {
      // Show the server's validation message under the input
      const { email: emailError } = result.fieldErrors;
      if (emailError) setErrors({ email: emailError });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    navigate("/verify-otp", { state: { identifier } });
  };

  const showError = touched && errors.email;

  return (
    <AuthPage>
      <BackLink fallback="/sign-in" />

      <AuthHeader
        className="mt-6"
        title="Forgot password"
        subtitle="Please enter your email to reset your password"
      />

      <form className="mt-8 space-y-5" onSubmit={handleFormSubmit} noValidate>
        <FormField label="Email" htmlFor="forgot-email" error={showError}>
          <input
            id="forgot-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors(validate(e.target.value));
            }}
            onBlur={() => {
              setTouched(true);
              setErrors(validate());
            }}
            aria-invalid={Boolean(showError)}
            placeholder="you@example.com"
            className={cn(inputClass, showError && inputErrorClass)}
          />
        </FormField>

        <Button
          type="submit"
          className={primaryButtonClass}
          disabled={loading}
        >
          {loading ? "Sending code..." : "Reset Password"}
        </Button>
      </form>

      <SupportButton />
    </AuthPage>
  );
};

export default ForgotPasswordForm;
