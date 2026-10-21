import { useEffect } from "react";
import successIcon from "@/assets/icons/success.svg";
import { StatusMessage } from "@/components/auth/AuthUI";
import {
  modalOverlayClass,
  modalPanelClass,
} from "@/components/auth/authStyles";

const SuccessForm = ({ onNext }) => {
  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onNext]);

  return (
    <div className={modalOverlayClass}>
      <div className={modalPanelClass}>
        <StatusMessage
          icon={successIcon}
          title="Thank You!"
          message="Your profile has been submitted for verification. We will notify you once you are verified."
        />
      </div>
    </div>
  );
};

export default SuccessForm;
