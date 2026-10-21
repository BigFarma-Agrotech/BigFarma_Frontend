import { cn } from "@/lib/utils";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-base focus:border-primary-light focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
