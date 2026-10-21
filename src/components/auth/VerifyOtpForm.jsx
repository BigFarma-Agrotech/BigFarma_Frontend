"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import Button from "@/components/shared/Button";
import OtpInput from "@/components/shared/OtpInput";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { verifyOtp } from "@/components/queries/auth/verifyOtp";
import { requestOtp } from "@/components/queries/auth/register";
import { toast } from "react-toastify";

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
    if (value.length !== 6) return;
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

  const handleBack = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen mx-auto flex items-center justify-center p-4">
      <div className="w-full max-w-[650px]">
        <div className="space-y-8 p-5 md:p-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-1 p-0 h-auto focus:outline-none focus:ring-0"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-xl md:text-[32px] font-bold">
                Enter the verification code
              </h1>
              <p className="text-lg">
                We sent a 6 digit code to{" "}
                <span className="font-medium">{identifier}</span>. Please enter it to
                continue
              </p>
            </div>
            <div className="flex justify-center">
              <OtpInput length={6} value={value} onChange={setValue} />
            </div>
            <Button
              onClick={handleVerify}
              className="w-full"
              variant="default"
              disabled={value.length !== 6 || loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="text-center">
              <span className="">{"Haven't gotten code yet? "}</span>
              <button
                variant="link"
                onClick={handleResendCode}
                className="text-[#ffa725] hover:text-[#ffa725] font-medium p-0 h-auto cursor-pointer"
                disabled={isResending || timer > 0}
              >
                {isResending
                  ? "Resending..."
                  : timer > 0
                  ? `Resend code in ${timer}s`
                  : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtpForm;
