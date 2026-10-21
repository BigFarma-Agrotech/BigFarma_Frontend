import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { FaRegCommentDots } from "react-icons/fa";
import {
  MdOutlineLiveHelp,
  MdOutlinePhone,
  MdOutlineEmail,
} from "react-icons/md";

const iconProps = { size: 22, className: "shrink-0", "aria-hidden": true };

// Contact details mirror the landing page ContactUs section.
const options = [
  {
    label: "FAQ / help center",
    icon: <MdOutlineLiveHelp {...iconProps} />,
    href: "/#faqs",
  },
  {
    label: "In-app chat",
    icon: <FaRegCommentDots {...iconProps} />,
    onClick: () => toast.info("In-app chat is coming soon"),
  },
  {
    label: "Email support",
    icon: <MdOutlineEmail {...iconProps} />,
    href: "mailto:hello@bigfarma.com",
  },
  {
    label: "Phone hotline",
    icon: <MdOutlinePhone {...iconProps} />,
    href: "tel:+2349043120419",
  },
];

const optionClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-subtle";

const SupportContent = ({ onClose }) => (
  <>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close support options"
        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-grey-300 transition-colors hover:bg-gray-100 hover:text-neutral"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    )}

    <div className="space-y-1 pb-6 text-center">
      <h2 className="text-2xl font-bold text-text-neutral">Need help?</h2>
      <p className="text-base text-neutral">
        Explore the following support options
      </p>
    </div>

    <div className="flex flex-col gap-3">
      {options.map(({ label, icon, href, onClick }) =>
        href ? (
          // Plain <a>: mailto/tel need it, and a full load of "/#faqs" lets
          // the browser scroll to the FAQ section on the landing page.
          <a key={label} href={href} className={optionClass}>
            {icon}
            {label}
          </a>
        ) : (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={optionClass}
          >
            {icon}
            {label}
          </button>
        ),
      )}
    </div>
  </>
);

/**
 * Support options. By default renders as a modal / bottom sheet controlled by
 * `show` + `onClose`. Pass `inline` to render the panel directly in the page.
 */
const Support = ({ show, onClose, inline = false }) => {
  if (inline) {
    return (
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <SupportContent />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="support-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Support options"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <SupportContent onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Support;
