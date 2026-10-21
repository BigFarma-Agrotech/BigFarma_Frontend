import { useState, useEffect } from "react";
import pendingIcon from "@/assets/icons/pending.png";
import LoaderSpinner from "@/components/shared/Loader";
import { StatusMessage } from "@/components/auth/AuthUI";
import {
  modalOverlayClass,
  modalPanelClass,
} from "@/components/auth/authStyles";

const PendingVerification = ({ onNext }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // show pending first, then switch to loading
    const loaderTimer = setTimeout(() => {
      setLoading(true);
    }, 1500);

    // after loading, redirect
    const redirectTimer = setTimeout(() => {
      onNext();
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(redirectTimer);
    };
  }, [onNext]);

  if (loading) return <LoaderSpinner />;

  return (
    <div className={modalOverlayClass}>
      <div className={modalPanelClass}>
        <StatusMessage
          icon={pendingIcon}
          title="Your account is almost ready!"
          message="We're verifying your details. Please check your email or SMS for a verification message. Once confirmed, you'll be able to add your products to the marketplace."
        />
      </div>
    </div>
  );
};

export default PendingVerification;
