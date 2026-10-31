import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Link } from "react-scroll";
import { HiMenu, HiX } from "react-icons/hi";
import brandLogo from "../../assets/images/brand-logo.webp";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about-us", label: "About Us" },
  { id: "faqs", label: "FAQs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact-us", label: "Contact Us" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleHamburgerMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="relative z-40 w-full">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="home"
          href="#home"
          smooth={true}
          duration={500}
          className="shrink-0 cursor-pointer"
          onClick={closeMenu}
        >
          <img
            src={brandLogo}
            alt="BigFarma logo"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </Link>

        {/* Desktop menu */}
        <nav
          aria-label="Main"
          className="navlink hidden items-center gap-6 text-base font-medium lg:flex xl:gap-8"
        >
          {NAV_LINKS.map(({ id, label }) => (
            <Link
              key={id}
              to={id}
              href={`#${id}`}
              smooth={true}
              duration={500}
              className="cursor-pointer whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Sign In / Sign Up */}
        <div className="hidden items-center gap-3 lg:flex">
          <NavLink
            to="/sign-in"
            className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/role"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Sign Up
          </NavLink>
        </div>

        {/* Mobile: Sign In + hamburger toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <NavLink
            to="/sign-in"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Sign In
          </NavLink>

          <button
            type="button"
            onClick={toggleHamburgerMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-dark transition-colors hover:bg-primary-subtle"
          >
            {/* The key swap remounts the icon, replaying its CSS animation */}
            <span key={isOpen ? "close" : "open"} className="flex animate-spin-in">
              {isOpen ? <HiX className="h-7 w-7" /> : <HiMenu className="h-7 w-7" />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="navlink animate-drop-in absolute inset-x-0 top-full z-50 flex w-full flex-col items-center gap-5 border-t border-grey-100 bg-white px-4 py-6 shadow-md lg:hidden"
          >
            {NAV_LINKS.map(({ id, label }) => (
              <Link
                key={id}
                to={id}
                href={`#${id}`}
                smooth={true}
                duration={500}
                className="cursor-pointer text-base font-medium"
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
            <NavLink
              to="/role"
              onClick={closeMenu}
              className="w-full max-w-xs rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Sign Up
            </NavLink>
          </nav>
      )}
    </header>
  );
};

export default NavBar;
