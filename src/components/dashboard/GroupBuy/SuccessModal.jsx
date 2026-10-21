import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import successIcon from "../../../assets/icons/success.svg";

const SuccessModal = ({ groupId, onClose }) => {
  const [copy, setCopy] = useState(false);
  const hasId = groupId !== undefined && groupId !== null && groupId !== "";
  const groupPath = hasId ? `/group-buy/${groupId}` : "/group-buy";
  const link = `${window.location.origin}${groupPath}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopy(true);
      setTimeout(() => {
        setCopy(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-success-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center space-y-4 pt-4 text-center">
          <img src={successIcon} alt="" aria-hidden="true" className="h-16 w-16 sm:h-20 sm:w-20" />
          <h2
            id="group-success-title"
            className="text-xl font-bold leading-tight text-primary sm:text-2xl"
          >
            Your group has been created successfully!
          </h2>
          <p className="text-sm text-gray-700 sm:text-base">
            Share the link below so others can join your group purchase
          </p>
          <div className="flex w-full flex-col items-center gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:justify-between">
            <Link to={groupPath} onClick={onClose} className="min-w-0 break-all text-sm text-secondary hover:underline sm:text-base">
              {link}
            </Link>
            <button
              onClick={handleCopy}
              type="button"
              className={`h-9 shrink-0 rounded-lg border px-4 text-sm font-medium transition-colors ${
                copy
                  ? "border-primary bg-primary text-white"
                  : "border-primary text-primary hover:bg-primary-subtle"
              }`}
            >
              {copy ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to={groupPath}
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary-dark sm:w-auto"
          >
            {hasId ? "Go to Group Details" : "Go to Group Buy"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
