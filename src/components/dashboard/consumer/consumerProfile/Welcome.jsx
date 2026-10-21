import Button from "@/components/shared/Button";
import {
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  titleClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";

const ConsumerOverlay = ({ onNext }) => {
  return (
    <div className={modalOverlayClass}>
      <div
        className={cn(modalPanelClass, "max-w-md text-center")}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={titleClass}>Let&apos;s set up your profile</h2>
        <Button onClick={onNext} className={cn(primaryButtonClass, "mt-8")}>
          Start Setup
        </Button>
      </div>
    </div>
  );
};

export default ConsumerOverlay;
