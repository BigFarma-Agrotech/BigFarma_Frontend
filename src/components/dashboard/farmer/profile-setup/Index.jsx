import { useCallback, useEffect, useRef, useState } from "react";
import AboutFarm from "./AboutFarm";
import BioData from "./BioData";
import VerifyIdentity from "./VerifyIdentity";
import Success from "./Success";
import PendingVerification from "./PendingVerification";

const LAST_STEP = 5;

export default function FarmerProfileSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const completedRef = useRef(false);

  // Stable identity so Success / PendingVerification timers (which depend on
  // onNext) aren't restarted on every render.
  const handleNext = useCallback((data) => {
    if (data && typeof data === "object") {
      setFormData((prev) => ({ ...prev, ...data }));
    }
    setStep((prev) => prev + 1);
  }, []);

  // Notify the parent once, after render (calling it during render is a side effect).
  useEffect(() => {
    if (step > LAST_STEP && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(formData);
    }
  }, [step, formData, onComplete]);

  return (
    <>
      {step === 1 && <BioData onNext={handleNext} />}
      {step === 2 && <VerifyIdentity onNext={handleNext} />}
      {step === 3 && <AboutFarm onNext={handleNext} />}
      {step === 4 && <Success onNext={handleNext} />}
      {step === 5 && <PendingVerification onNext={handleNext} />}
    </>
  );
}
