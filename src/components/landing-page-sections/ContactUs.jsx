import { useState } from "react";
import { toast } from "react-toastify";
import { submitContactMessage, FeatureUnavailableError } from "../../lib/pendingApi";
import phoneIcon from "../../assets/icons/phone.svg";
import mailIcon from "../../assets/icons/mail.svg";
import instagramIcon from "../../assets/icons/instagram.svg";
import linkedInIcon from "../../assets/icons/linkedin.svg";
import facebookIcon from "../../assets/icons/facebook.svg";

const contactDetails = [
  {
    icon: phoneIcon,
    label: "Phone",
    value: "+234 904 312 0419",
    href: "tel:+2349043120419",
  },
  {
    icon: mailIcon,
    label: "Email",
    value: "hello@bigfarma.com",
    href: "mailto:hello@bigfarma.com",
  },
  { icon: instagramIcon, label: "Instagram", value: "bigfarma.ng" },
  { icon: linkedInIcon, label: "LinkedIn", value: "bigfarma" },
  { icon: facebookIcon, label: "Facebook", value: "bigfarma" },
];

const inputClass =
  "w-full rounded-lg border border-grey-100 bg-transparent px-4 py-3 text-base outline-none placeholder:text-grey-200 focus:border-primary focus:ring-2 focus:ring-primary-transparent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,15}$/;
const EMPTY_FORM = { fullName: "", emailOrPhone: "", message: "" };

const validate = ({ fullName, emailOrPhone, message }) => {
  const errors = {};
  const contact = emailOrPhone.trim();
  if (!fullName.trim()) errors.fullName = "Please enter your name.";
  if (!contact) {
    errors.emailOrPhone = "Please enter your email or phone number.";
  } else if (!EMAIL_RE.test(contact) && !PHONE_RE.test(contact)) {
    errors.emailOrPhone = "Enter a valid email address or phone number.";
  }
  if (!message.trim()) errors.message = "Please enter a message.";
  return errors;
};

const ContactUs = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSending(true);
    try {
      await submitContactMessage(form);
      toast.success("Thanks! We'll get back to you soon.");
      setForm(EMPTY_FORM);
    } catch (error) {
      if (error instanceof FeatureUnavailableError) {
        toast.info(`${error.message} Please email us at hello@bigfarma.com.`);
      } else {
        toast.error("Couldn't send your message. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact-us" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2 text-center md:mb-12">
          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            Contact Us
          </h2>
          <p className="text-base md:text-lg">
            We are here for you! How can we help you?
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-grey-100 bg-white shadow-lg lg:grid-cols-5">
          {/* Contact details */}
          <aside className="order-2 bg-primary p-6 text-white sm:p-8 lg:order-1 lg:col-span-2 lg:p-10">
            <ul className="flex flex-col gap-5 text-base md:text-lg">
              {contactDetails.map(({ icon, label, value, href }) => (
                <li key={label} className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <img src={icon} alt="" aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="sr-only">{label}:</span>
                  {href ? (
                    <a href={href} className="break-all hover:underline">
                      {value}
                    </a>
                  ) : (
                    <span className="break-all">{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} className="order-1 flex flex-col gap-5 p-6 sm:p-8 lg:order-2 lg:col-span-3 lg:p-10">
            <h3 className="text-xl font-bold sm:text-2xl">Get in Touch</h3>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-full-name" className="font-semibold">
                Full Name
              </label>
              <input
                id="contact-full-name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "contact-fullName-error" : undefined}
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className={inputClass}
              />
              {errors.fullName && (
                <p id="contact-fullName-error" className="text-sm text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email-or-phone" className="font-semibold">
                Email or Phone Number
              </label>
              <input
                id="contact-email-or-phone"
                name="emailOrPhone"
                value={form.emailOrPhone}
                onChange={handleChange}
                aria-invalid={Boolean(errors.emailOrPhone)}
                aria-describedby={errors.emailOrPhone ? "contact-emailOrPhone-error" : undefined}
                type="text"
                placeholder="Enter your email or phone number"
                className={inputClass}
              />
              {errors.emailOrPhone && (
                <p id="contact-emailOrPhone-error" className="text-sm text-red-500">
                  {errors.emailOrPhone}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="font-semibold">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                rows={5}
                placeholder="Type your message here..."
                className={`${inputClass} resize-y`}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-sm text-red-500">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 sm:w-fit"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
