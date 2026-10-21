import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPasswordRequest } from "@/components/queries/auth/forgotPasswordRequest";
import Button from "@/components/shared/Button";
import {
  AuthHeader,
  AuthPage,
  BackLink,
  CountryInput,
  FormField,
  SupportButton,
} from "./AuthUI";
import { primaryButtonClass } from "./authStyles";

const ForgotPasswordForm = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ phone: false, country: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Country selection
  const updateCountry = (country) => {
    setDropdownOpen(false);
    setTouched((prev) => ({ ...prev, country }));
  };

  const handleDropdownToggle = () => setDropdownOpen(!dropdownOpen);

  const validate = (value = phoneNumber) => {
    const newErrors = {};
    const isPhoneValid = value && value.length >= 10;

    if (!isPhoneValid) {
      newErrors.phone = "Please enter a valid phone number or email address.";
    }

    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setTouched((prev) => ({ ...prev, phone: true }));
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      let payload = {};
      if (phoneNumber.includes("@")) {
        payload = {
          email: phoneNumber,
          phone: "",
          medium: "email",
          otp_type: "password_reset",
        };
      } else {
        payload = {
          email: "",
          phone: phoneNumber,
          medium: "phone",
          otp_type: "password_reset",
        };
      }
      setErrors({});
      setLoading(true);
      try {
        const result = await forgotPasswordRequest(payload);
        if (result.isSuccess) {
          toast.success(result.message || "Password reset code sent!");
          navigate("/verify-otp", { state: { email: phoneNumber } });
        } else {
          toast.error(result.message || "Failed to send reset code.");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to send reset code.");
      } finally {
        setLoading(false);
      }
    }
  };

  const showError = touched.phone && errors.phone;

  return (
    <AuthPage>
      <BackLink fallback="/sign-in" />

      <AuthHeader
        className="mt-6"
        title="Forgot password"
        subtitle="Please enter your email or phone number to reset your password"
      />

      <form className="mt-8 space-y-5" onSubmit={handleFormSubmit} noValidate>
        <FormField
          label="Phone number or Email"
          htmlFor="PhoneOrEmail"
          error={showError}
        >
          <CountryInput
            id="PhoneOrEmail"
            name="PhoneOrEmail"
            autoComplete="username"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              const newErrors = validate(e.target.value);
              setErrors((prev) => ({ ...prev, phone: newErrors.phone }));
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, phone: true }));
              const newErrors = validate();
              setErrors((prev) => ({ ...prev, phone: newErrors.phone }));
            }}
            placeholder="Your phone number or email"
            dropdownOpen={dropdownOpen}
            onToggle={handleDropdownToggle}
            onSelect={updateCountry}
            hasError={Boolean(showError)}
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
