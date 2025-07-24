import React from 'react';
import brandLogo from '../assets/images/brand-logo.png';
import faceBook from '../assets/images/Facebook.svg';
import instagran from '../assets/images/Instagram.svg';
import x from '../assets/images/X.svg';
import linkedIn from '../assets/images/LinkedIn.svg';
import { Link, NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full  bg-[var(--color-primary-dark)] text-white mt-20">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start p-9 gap-6">
          <div className="max-w-[300px]">
            <img
              src={brandLogo}
              alt="Brand Logo"
              className="h-9 w-[150px] mb-8 object-contain"
            />

            <p className="mb-4">
              BigFarma is a digital platform that connects farmers and consumers
              in one simple app. Farmers sell produce, access finance, and get
              farming support, while consumers buy fresh farm products and
              invest directly in verified farm projects.
            </p>

            <div className="flex gap-2">
              <img src={linkedIn} alt="LinkedIn" />
              <img src={x} alt="X" />
              <img src={faceBook} alt="Facebook" />
              <img src={instagran} alt="Instagram" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-8">Company</h3>
            <nav className="flex flex-col gap-4">
              <NavLink to="/home">Home</NavLink>
              <NavLink to="/about-us">About Us</NavLink>
              <NavLink to="/faqs">FAQs</NavLink>
              <NavLink to="/testimonials">Testimonials</NavLink>
              <NavLink to="/contact-us">Contact Us</NavLink>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-8">Legal information</h3>
            <nav className="flex flex-col gap-4">
              <NavLink to="/privacy-policy">Privacy Policy</NavLink>
              <NavLink to="/terms-of-service">Terms and conditions</NavLink>
            </nav>
          </div>

          <div className="max-w-[300px]">
            <h3 className="text-lg font-semibold mb-8">Stay connected</h3>
            <p className="mb-4">
              Subscribe to get updates on new features, market opportunities,
              and platform offers.
            </p>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 mb-2 border border-gray-300 colors-neutral-light"
              />
              <button className="bg-white text-[var(--color-primary)] px-4 py-4 rounded-md mt-2 w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
