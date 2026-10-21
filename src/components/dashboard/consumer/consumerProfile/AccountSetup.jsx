import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Button from "@/components/shared/Button";
import Dropdown from "@/components/shared/Dropdown";
import { FormField } from "@/components/auth/AuthUI";
import {
  inputClass,
  labelClass,
  linkClass,
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  textareaClass,
  titleClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";
import joy from "@/assets/images/review-joy.jpg";
import { countries } from "../../../../lib/countries";
import { endpoints } from "../../../config/endpoints";
import { axios } from "../../../../lib/axios";
import { parseApiError } from "@/lib/apiError";
import { useAccountContact } from "@/hooks/useAccountContact";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function AccountSetup({ onSkip, onNext }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });

  const fileInputRef = useRef(null);

  // Email/phone already on the account are shown and locked; only the
  // missing one can be typed in
  const account = useAccountContact();
  const email = account.email || form.email;
  const phone = account.phone || form.phone;

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Country selection
  const updateCountry = (country) => {
    setDropdownOpen(false);
    setForm((prev) => ({ ...prev, country }));
  };

  const handleDropdownToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDropdownOpen((prev) => !prev);
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Opens the hidden file input
  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (
      !(
        form.firstName.trim() &&
        form.lastName.trim() &&
        phone.trim() &&
        email.trim() &&
        form.address.trim()
      )
    ) {
      toast.error(
        "Please fill in your first name, last name, email, phone number and address.",
      );
      return;
    }
    // Backend limits (ConsumerProfileCreate): names >= 2 chars, address >= 5 chars
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      toast.error("First and last name must be at least 2 characters.");
      return;
    }
    if (form.address.trim().length < 5) {
      toast.error("Address must be at least 5 characters.");
      return;
    }

    // Prepare data to send
    const dataToSend = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      address: form.address.trim(),
      profile_picture: profileImage || null,
      crop_preferences: ["vegetables"],
      email: email.trim(),
      phone: phone.trim(),
    };

    setLoading(true);
    try {
      const res = await axios.post(
        endpoints().users.create_consumer_profile,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("BIGFARMA_ACCESS_TOKEN")}`,
          },
        },
      );

      const data = res.data;
      if (res.status === 200 || res.status === 201) {
        toast.success(data.message || "Saved successfully!");
        onNext(data);
      } else {
        toast.error(data.message || "Network error. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(parseApiError(error, "Profile setup failed").message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalOverlayClass}>
      <div className={modalPanelClass}>
        <h2 className={cn(titleClass, "text-center")}>Set up your profile</h2>

        {/* Profile image */}
        <div className="mt-6 flex flex-col items-center">
          <img
            src={profileImage || joy}
            alt="Profile"
            className="h-24 w-24 rounded-full border-4 border-grey-100 object-cover sm:h-28 sm:w-28"
          />
          <button
            type="button"
            onClick={handleEdit}
            className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            Edit
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            aria-label="Upload profile photo"
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="First Name" htmlFor="firstName" required>
              <input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={form.firstName}
                required
                onChange={handleChange}
                placeholder="John"
                className={inputClass}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required>
              <input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                required
                onChange={handleChange}
                placeholder="Doe"
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Email and phone number */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Email" htmlFor="email" required>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={Boolean(account.email)}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className={inputClass}
              />
              {account.email && (
                <p className="mt-1.5 text-xs text-grey-300">From your account</p>
              )}
            </FormField>
            <FormField label="Phone Number" htmlFor="phone" required>
              <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-grey-100 bg-white pl-3 transition-colors focus-within:border-primary has-[:disabled]:bg-gray-50">
                <Dropdown
                  countries={countries}
                  onSelect={updateCountry}
                  isOpen={dropdownOpen}
                  onToggle={handleDropdownToggle}
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  disabled={Boolean(account.phone)}
                  onChange={handleChange}
                  required
                  placeholder="08022222222"
                  className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent pr-4 text-base text-text-neutral placeholder:text-grey-200 focus:outline-none disabled:cursor-not-allowed disabled:text-grey-300"
                />
              </div>
              {account.phone && (
                <p className="mt-1.5 text-xs text-grey-300">From your account</p>
              )}
            </FormField>
          </div>

          {/* Gender */}
          <fieldset>
            <legend className={labelClass}>Gender</legend>
            <div className="grid grid-cols-2 gap-4">
              {genderOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-grey-100 px-4 text-base transition-colors focus-within:border-primary"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    className="h-4 w-4 accent-primary"
                    checked={form.gender === value}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Address */}
          <FormField label="Address" htmlFor="address" required>
            <textarea
              id="address"
              name="address"
              required
              autoComplete="street-address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Example Street, Ikeja, Lagos."
              className={textareaClass}
            />
          </FormField>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:gap-4">
            <button
              type="button"
              className={cn(linkClass, "h-12 w-full sm:w-1/3")}
              onClick={onSkip}
            >
              Skip
            </button>
            <Button
              type="submit"
              className={cn(primaryButtonClass, "sm:flex-1")}
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
