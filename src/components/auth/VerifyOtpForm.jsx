import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import OtpInput from "@/components/shared/OtpInput";
import { verifyOtp } from "@/components/queries/auth/verifyOtp";
import { requestOtp } from "@/components/queries/auth/register";
import { AuthHeader, AuthPage, BackLink } from "./AuthUI";
import { linkClass, primaryButtonClass } from "./authStyles";

function VerifyOtpForm(props) {
  const location = useLocation();
  // Email or phone number the reset code was sent to
  const identifier = location.state?.identifier || props.email || "";
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

  // Without an email/phone there is nothing to verify
  if (!identifier) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleVerify = async () => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    const result = await verifyOtp({
      identifier,
      code: value,
      otp_type: "password_reset",
    });
    setLoading(false);

    if (!result.isSuccess) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    // The reset endpoint doesn't take the code; the server tracks the verification
    navigate("/reset-password", { state: { identifier, verified: true } });
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setValue("");
    const result = await requestOtp({ identifier, otp_type: "password_reset" });
    setIsResending(false);
    if (result.isSuccess) {
      toast.success(result.message);
      setTimer(60);
    } else {
      toast.error(result.message);
    }
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
              {identifier}
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
