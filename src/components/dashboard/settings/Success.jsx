import { useNavigate } from "react-router-dom";
import Button from "@/components/shared/Button";
import successIcon from "../../../assets/icons/success.svg";

const SuccessModal = ({ message, isOpen, path }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 text-center sm:p-6"
      >
        <img
          src={successIcon}
          alt=""
          className="mx-auto h-16 w-16 sm:h-24 sm:w-24"
        />
        <h2
          id="success-title"
          className="mt-6 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl"
        >
          Successful
        </h2>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <Button onClick={() => navigate(path)} className="mt-6 h-12 w-full py-0">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SuccessModal;
