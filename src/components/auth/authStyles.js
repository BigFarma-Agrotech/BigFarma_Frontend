// Shared class names for every auth and onboarding screen, so they all read
// as one design system. Import these instead of re-typing utility strings.

export const titleClass = "text-2xl font-bold text-text-neutral sm:text-3xl";

export const subtitleClass = "mt-2 text-base text-grey-300";

export const labelClass = "mb-2 block text-sm font-semibold text-text-neutral";

export const inputClass =
  "h-12 w-full rounded-lg border border-grey-100 bg-white px-4 text-base text-text-neutral transition-colors placeholder:text-grey-200 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-grey-300";

export const textareaClass =
  "min-h-24 w-full rounded-lg border border-grey-100 bg-white px-4 py-3 text-base text-text-neutral transition-colors placeholder:text-grey-200 focus:border-primary focus:outline-none";

export const inputErrorClass = "border-red-500 focus:border-red-500";

export const errorClass = "mt-1.5 text-sm text-red-500";

export const linkClass =
  "font-medium text-secondary transition-colors hover:text-secondary-dark";

export const primaryButtonClass = "h-12 w-full py-0";

export const backLinkClass =
  "inline-flex items-center gap-1 text-sm font-medium text-neutral transition-colors hover:text-primary";

export const modalOverlayClass =
  "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4";

export const modalPanelClass =
  "max-h-[90vh] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-xl bg-white p-5 shadow-lg sm:p-8";
