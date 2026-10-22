import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import OtpInput from "@/components/shared/OtpInput";
import { verifyOtp } from "@/components/queries/auth/verifyOtp";
import { requestOtp } from "@/components/queries/auth/register";
import { setSession } from "@/lib/auth";
import successIcon from "@/assets/icons/success.svg";
import { AuthHeader, AuthPage, BackLink, StatusMessage } from "./AuthUI";
import { linkClass, primaryButtonClass } from "./authStyles";

function InputOtpForm(props) {
  const location = useLocation();
  // Email or phone number the code was sent to
  const identifier = location.state?.identifier || props.email || "";
  const [value, setValue] = useState("");
  // All six boxes filled (an empty box in the middle is held as a space)
  const isComplete = /^\d{6}$/.test(value);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
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
    return <Navigate to="/sign-up" replace />;
  }

  const handleVerify = async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    const result = await verifyOtp({
      identifier,
      code: value,
      otp_type: "verification",
    });
    setLoading(false);

    if (!result.isSuccess) {
      toast.error(result.message);
      return;
    }

    // Sign the user straight in if the server returns a token with the verification
    if (result.data?.access_token) {
      setSession(result.data);
      setIsSignedIn(true);
    }
    toast.success(result.message);
    setIsSuccess(true);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setValue("");
    const result = await requestOtp({ identifier, otp_type: "verification" });
    setIsResending(false);
    if (result.isSuccess) {
      toast.success(result.message);
      setTimer(60);
    } else {
      toast.error(result.message);
    }
  };

  const handleContinue = () => {
    navigate(isSignedIn ? "/dashboard" : "/sign-in", { replace: true });
  };

  if (isSuccess) {
    return (
      <AuthPage>
        <StatusMessage
          icon={successIcon}
          title="Successful"
          message={
            isSignedIn
              ? "Congratulations, your account has been successfully created."
              : "Your account has been verified. Sign in to continue."
          }
        >
          <Button onClick={handleContinue} className={primaryButtonClass}>
            Continue
          </Button>
        </StatusMessage>
      </AuthPage>
    );
  }

  return (
    <AuthPage>
      <BackLink fallback="/sign-up" />

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
          disabled={!isComplete || loading}
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

export default InputOtpForm;
