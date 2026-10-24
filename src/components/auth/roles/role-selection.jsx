import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FocusContext } from "@/context/FocusContext";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import FarmerIcon from "@/assets/svgs/farmer.svg";
import LightFarmer from "@/assets/svgs/light-farmer.svg";
import Cart from "@/assets/svgs/cart.svg";
import LightCart from "@/assets/svgs/light-cart.svg";
import { AuthHeader, AuthPage } from "../AuthUI";
import { primaryButtonClass } from "../authStyles";

const roles = [
  {
    id: "farmer",
    title: "I'm a Farmer",
    description: "I want to list and manage my farm products",
    icon: FarmerIcon,
    activeIcon: LightFarmer,
  },
  {
    id: "consumer",
    title: "I'm a Consumer",
    description: "I want to explore and purchase farm produce",
    icon: Cart,
    activeIcon: LightCart,
  },
];

export function RoleSelectionForm() {
  const { role, setRole } = useContext(FocusContext);
  const navigate = useNavigate();

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
  };

  const handleContinue = () => {
    if (role) {
      navigate(`/sign-up/${role}`);
    } else {
      toast.error("Please select a role first");
    }
  };

  return (
    <AuthPage wide card={false}>
      <AuthHeader
        center
        title="Welcome to BigFarma"
        subtitle="Before we proceed, tell us who you are. This helps us personalize your experience."
        className="mx-auto max-w-lg"
        titleClassName="text-primary"
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6">
        {roles.map(({ id, title, description, icon, activeIcon }) => {
          const selected = role === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => handleRoleSelect(id)}
              className={cn(
                "relative flex min-h-52 w-full flex-col justify-center rounded-xl border p-6 text-left transition-colors sm:min-h-72 sm:p-8",
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-grey-100 bg-white hover:border-primary",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border bg-white",
                  selected ? "border-white" : "border-primary",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>

              <img
                src={selected ? activeIcon : icon}
                alt=""
                className="mb-6 h-12 w-12 drop-shadow-xl"
              />
              <span
                className={cn(
                  "mb-2 text-2xl font-semibold sm:text-3xl",
                  selected ? "text-white" : "text-primary",
                )}
              >
                {title}
              </span>
              <span
                className={cn(
                  "text-base",
                  selected ? "text-primary-subtle" : "text-grey-300",
                )}
              >
                {description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center sm:mt-10">
        <Button
          onClick={handleContinue}
          disabled={!role}
          className={cn(primaryButtonClass, "sm:max-w-xs")}
        >
          Continue
        </Button>
      </div>
    </AuthPage>
  );
}
