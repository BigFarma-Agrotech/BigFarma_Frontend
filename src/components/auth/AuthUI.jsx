import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Card from "@/components/shared/Card";
import Dropdown from "@/components/shared/Dropdown";
import { countries } from "@/lib/countries";
import { cn } from "@/lib/utils";
import MobileBg from "@/assets/images/MobileSignup.webp";
import DesktopBg from "@/assets/images/DesktopSignUp.webp";
import supportIcon from "@/assets/icons/Support_Icon .png";
import Support from "./Support";
import {
  backLinkClass,
  errorClass,
  inputClass,
  inputErrorClass,
  labelClass,
  subtitleClass,
  titleClass,
} from "./authStyles";

/**
 * Centered single-column auth screen. On mobile the content sits directly on
 * a white page; from `sm` up it is wrapped in a card on a light grey page.
 */
export function AuthPage({ children, wide = false, card = true }) {
  const width = wide ? "max-w-3xl" : "max-w-lg";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-4 pb-24 pt-8 sm:bg-gray-50 sm:px-6 sm:py-12">
      {card ? (
        <Card
          className={cn(
            "w-full rounded-none bg-transparent shadow-none sm:rounded-xl sm:bg-white sm:p-8 sm:shadow-sm",
            width,
          )}
        >
          {children}
        </Card>
      ) : (
        <div className={cn("w-full", width)}>{children}</div>
      )}
    </main>
  );
}

/**
 * Split-screen layout used by Sign In / Sign Up. Image on the left from `lg`
 * up; a short banner image above the form on smaller screens.
 */
export function AuthSplitLayout({ children, imageAlt }) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      <div className="h-44 w-full shrink-0 overflow-hidden sm:h-60 lg:sticky lg:top-0 lg:h-screen lg:w-2/5">
        <picture className="block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={DesktopBg} />
          <img
            src={MobileBg}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        </picture>
      </div>

      <div className="relative -mt-6 flex flex-1 items-center justify-center rounded-t-2xl bg-white px-4 pb-24 pt-8 sm:px-6 sm:py-10 lg:mt-0 lg:rounded-none lg:px-12">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </main>
  );
}

export function AuthHeader({
  title,
  subtitle,
  center = false,
  className = "",
  titleClassName = "",
}) {
  return (
    <div className={cn(center && "text-center", className)}>
      <h1 className={cn(titleClass, titleClassName)}>{title}</h1>
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
    </div>
  );
}

/**
 * "Back" control. With `to` it is a plain link; with `onClick` it runs the
 * handler; otherwise it returns to the previous history entry, falling back
 * to `fallback` when the page was opened directly (no in-app history).
 */
export function BackLink({ to, onClick, fallback = "/", className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.key && location.key !== "default") {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  const content = (
    <>
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      Back
    </>
  );

  if (to) {
    return (
      <NavLink to={to} className={cn(backLinkClass, className)}>
        {content}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick || goBack}
      className={cn(backLinkClass, className)}
    >
      {content}
    </button>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className={errorClass}>{children}</p>;
}

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  className = "",
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function PasswordInput({ hasError = false, className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(inputClass, "pr-12", hasError && inputErrorClass, className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-grey-200 transition-colors hover:text-neutral"
      >
        {visible ? (
          <Eye className="h-5 w-5" aria-hidden="true" />
        ) : (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** Text input with the country flag dropdown inside the same bordered box. */
export function CountryInput({
  dropdownOpen,
  onToggle,
  onSelect,
  hasError = false,
  className = "",
  ...props
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-full items-center gap-2 rounded-lg border border-grey-100 bg-white pl-3 transition-colors focus-within:border-primary",
        hasError && "border-red-500 focus-within:border-red-500",
        className,
      )}
    >
      <Dropdown
        countries={countries}
        onSelect={onSelect}
        isOpen={dropdownOpen}
        onToggle={onToggle}
      />
      <input
        type="text"
        className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent pr-4 text-base text-text-neutral placeholder:text-grey-200 focus:outline-none"
        {...props}
      />
    </div>
  );
}

export function AuthDivider({ label = "or continue with" }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-grey-100" />
      <span className="text-sm text-grey-300">{label}</span>
      <span className="h-px flex-1 bg-grey-100" />
    </div>
  );
}

export function SocialButtons({ prefix }) {
  const buttonClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-neutral bg-white px-3 text-base text-text-neutral transition-colors hover:bg-gray-50";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <button
        type="button"
        className={buttonClass}
        onClick={() => toast.info("Google sign-in is coming soon")}
      >
        <FcGoogle className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {prefix && <span className="hidden sm:inline">{prefix} </span>}
          <strong className="font-semibold">Google</strong>
        </span>
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => toast.info("Apple sign-in is coming soon")}
      >
        <FaApple className="h-6 w-6 shrink-0 text-black" aria-hidden="true" />
        <span className="truncate">
          {prefix && <span className="hidden sm:inline">{prefix} </span>}
          <strong className="font-semibold">Apple</strong>
        </span>
      </button>
    </div>
  );
}

/** Floating help button that opens the Support sheet. */
export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open support options"
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-white shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <img src={supportIcon} alt="" className="h-full w-full" />
      </button>
      <Support show={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Icon + title + message block used by every success / status screen. */
export function StatusMessage({ icon, iconAlt = "", title, message, children }) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={icon} alt={iconAlt} className="h-20 w-20 sm:h-24 sm:w-24" />
      <h1 className={cn(titleClass, "mt-6")}>{title}</h1>
      {message && <p className={cn(subtitleClass, "max-w-md")}>{message}</p>}
      {children && <div className="mt-8 w-full">{children}</div>}
    </div>
  );
}
