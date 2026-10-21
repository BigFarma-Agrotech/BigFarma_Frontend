import { useNavigate } from "react-router-dom";
import Button from "@/components/shared/Button";
import successIcon from "@/assets/icons/success.svg";
import { AuthPage, StatusMessage } from "./AuthUI";
import { primaryButtonClass } from "./authStyles";

const SuccessForm = () => {
  const navigate = useNavigate();

  return (
    <AuthPage>
      <StatusMessage
        icon={successIcon}
        title="Successful"
        message="Congratulations, your password has been changed. Click continue to sign in."
      >
        <Button
          onClick={() => navigate("/sign-in")}
          className={primaryButtonClass}
        >
          Continue
        </Button>
      </StatusMessage>
    </AuthPage>
  );
};

export default SuccessForm;
