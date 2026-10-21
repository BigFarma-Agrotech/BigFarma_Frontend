import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 cursor-pointer rounded-lg px-4 py-3 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  default: "bg-primary text-white hover:bg-primary-dark",
  outline: "border border-primary bg-white text-primary hover:bg-primary-subtle",
  ghost: "bg-transparent text-gray-700 hover:text-gray-900",
  link: "bg-transparent text-secondary hover:text-secondary-dark underline p-0 h-auto",
};

export default function Button({
  children,
  variant = "default",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
