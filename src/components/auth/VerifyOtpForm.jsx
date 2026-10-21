import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import OtpInput from "@/components/shared/OtpInput";
import { verifyOtp } from "@/components/queries/auth/verifyOtp";
import { requestOtp } from "@/components/queries/auth/register";
import { AuthHeader, AuthPage, BackLink } from "./AuthUI";
import { linkClass, primaryButtonClass } from "./authStyles";

function VerifyOtpForm(props) {
  const location = useLocation();
  const email = location.state?.email || props.email || "";
  const [value, setValue] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const handleVerify = async () => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    const result = await verifyOtp({
      email,
      code: value,
      medium: "email",
      otp_type: "password_reset",
    });
    setLoading(false);
    if (result.isSuccess) {
      toast.success(result.message || "OTP verified successfully!");
      navigate("/reset-password", { state: { email, code: value } });
    } else {
      toast.error(result.message || "OTP verification failed.");
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setValue("");
    try {
      const otpPayload = {
        email: email || "",
        medium: "email",
        otp_type: "password_reset",
      };
      const result = await requestOtp(otpPayload);
      if (result.isSuccess) {
        toast.success(result.message || "OTP resent successfully!");
        setTimer(60);
      } else {
        toast.error(result.message || "Failed to resend OTP.");
      }
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    }
    setIsResending(false);
  };

  return (
    <AuthPage>
      <BackLink fallback="/forgot-password" />

      <AuthHeader
        className="mt-6"
        title="Enter the verification code"
        subtitle={
          <>
            We sent a 6 digit code to{" "}
            <span className="break-all font-medium text-text-neutral">
              {email}
            </span>
            . Please enter it to continue.
          </>
        }
      />

      <div className="mt-8 space-y-6">
        <OtpInput length={6} value={value} onChange={setValue} />

        <Button
          onClick={handleVerify}
          className={primaryButtonClass}
          disabled={value.length !== 6 || loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>

        <p className="text-center text-base text-text-neutral">
          Haven&apos;t gotten the code yet?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            className={`${linkClass} disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={isResending || timer > 0}
          >
            {isResending
              ? "Resending..."
              : timer > 0
                ? `Resend code in ${timer}s`
                : "Resend code"}
          </button>
        </p>
      </div>
    </AuthPage>
  );
}

export default VerifyOtpForm;
