import { cn } from "@/lib/utils";

export default function Card({ children, className = "", ...props }) {
  return (
    <div className={cn("rounded-xl bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}
