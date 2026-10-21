import { useState } from "react";
import { toast } from "react-toastify";
import { subscribeToNewsletter, FeatureUnavailableError } from "../../lib/pendingApi";
import { NavLink } from "react-router-dom";
import { Link } from "react-scroll";
import brandLogo from "../../assets/images/brand-logo.webp";
import faceBook from "../../assets/images/Facebook.svg";
import instagram from "../../assets/images/Instagram.svg";
import x from "../../assets/images/X.svg";
import linkedIn from "../../assets/images/LinkedIn.svg";

const companyLinks = [
  { id: "home", label: "Home" },
  { id: "about-us", label: "About Us" },
  { id: "faqs", label: "FAQs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact-us", label: "Contact Us" },
];

const socialIcons = [
  { src: linkedIn, alt: "LinkedIn" },
  { src: x, alt: "X" },
  { src: faceBook, alt: "Facebook" },
  { src: instagram, alt: "Instagram" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    try {
      await subscribeToNewsletter(email.trim());
      toast.success("You're subscribed!");
      setEmail("");
    } catch (error) {
      if (error instanceof FeatureUnavailableError) {
        toast.info(error.message);
      } else {
        toast.error("Couldn't subscribe. Please try again.");
      }
    }
  };

  return (
    <footer className="w-full bg-primary-dark text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 md:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] lg:px-8">
        <div className="max-w-sm">
          <img
            src={brandLogo}
            loading="lazy"
            alt="BigFarma logo"
            className="mb-6 h-9 w-auto object-contain"
          />

          <p className="mb-6 text-sm md:text-base">
            BigFarma is a digital platform that connects farmers and consumers
            in one simple app. Farmers sell produce, access finance, and get
            farming support, while consumers buy fresh farm products and invest
            directly in verified farm projects.
          </p>

          <div className="flex flex-wrap gap-2">
            {socialIcons.map(({ src, alt }) => (
              <img key={alt} src={src} alt={alt} className="h-10 w-10" />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold">Company</h3>
          <nav aria-label="Footer" className="flex flex-col gap-4">
            {companyLinks.map(({ id, label }) => (
              <Link
                key={id}
                to={id}
                href={`#${id}`}
                smooth={true}
                duration={500}
                className="w-fit cursor-pointer hover:underline"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold">Legal Information</h3>
          <nav aria-label="Legal" className="flex flex-col gap-4">
            <NavLink to="/privacy-policy" className="w-fit hover:underline">
              Privacy Policy
            </NavLink>
            <NavLink to="/terms-of-service" className="w-fit hover:underline">
              Terms and Conditions
            </NavLink>
          </nav>
        </div>

        <div className="max-w-sm">
          <h3 className="mb-6 text-lg font-semibold">Stay Connected</h3>
          <p className="mb-4">
            Subscribe to get updates on new features, market opportunities, and
            platform offers.
          </p>
          <form noValidate onSubmit={handleSubscribe}>
            <label htmlFor="footer-email" className="mb-2 block">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "footer-email-error" : undefined}
              className="mb-3 w-full rounded-lg bg-white px-4 py-3 text-base text-text-neutral outline-none placeholder:text-grey-200 focus:ring-2 focus:ring-primary-light"
            />
            {emailError && (
              <p id="footer-email-error" className="-mt-1 mb-3 text-sm text-red-200">
                {emailError}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary-subtle sm:w-fit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
