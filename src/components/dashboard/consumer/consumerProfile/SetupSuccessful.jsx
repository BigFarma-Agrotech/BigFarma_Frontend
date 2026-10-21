import Button from "@/components/shared/Button";
import successIcon from "@/assets/icons/success.svg";
import { StatusMessage } from "@/components/auth/AuthUI";
import {
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";

const SetupSuccessful = ({ onNext }) => {
  return (
    <div className={modalOverlayClass}>
      <div className={cn(modalPanelClass, "max-w-md")}>
        <StatusMessage
          icon={successIcon}
          title="Successful!"
          message="Your account is all set!"
        >
          <Button onClick={onNext} className={primaryButtonClass}>
            Go to Dashboard
          </Button>
        </StatusMessage>
      </div>
    </div>
  );
};

export default SetupSuccessful;
