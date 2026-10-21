import { useState } from "react";
import AccountSetup from "./AccountSetup";
import Welcome from "./Welcome";
import ConsumerPreferences from "./ConsumerPreferences";
import SetupSuccessful from "./SetupSuccessful";

export default function ConsumerProfileSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };
  // Used by steps whose button passes a click event rather than data.
  const goToNextStep = () => setStep((prev) => prev + 1);
  // Call onComplete from the click handler instead of during render.
  const handleFinish = () => onComplete?.(formData);

  return (
    <>
      {step === 1 && <Welcome onNext={goToNextStep} />}
      {step === 2 && <AccountSetup onNext={handleNext} onSkip={goToNextStep} />}
      {step === 3 && <ConsumerPreferences onNext={handleNext} />}
      {step === 4 && <SetupSuccessful onNext={handleFinish} />}
    </>
  );
}
