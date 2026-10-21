import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import { FormField } from "@/components/auth/AuthUI";
import {
  inputClass,
  labelClass,
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  subtitleClass,
  textareaClass,
  titleClass,
} from "@/components/auth/authStyles";
import customerPhoto from "@/assets/images/Customer-photo.png";
import { endpoints } from "../../../config/endpoints";
import { axios } from "../../../../lib/axios";
import { parseApiError } from "@/lib/apiError";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ProfileForm = ({ onNext }) => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const missing = [
      !formData.firstName.trim() && "first name",
      !formData.lastName.trim() && "last name",
      !formData.email.trim() && "email",
      !formData.phone.trim() && "phone number",
      !formData.address.trim() && "address",
    ].filter(Boolean);
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    // Backend limit (FarmerProfileCreate): home_address >= 5 chars
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    if (formData.address.trim().length < 5) {
      toast.error("Address must be at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      full_name: fullName,
      home_address: formData.address.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      profile_picture: image || null,
      id_document: "string",
      farm_name: "string",
      farm_type: "crop",
      farm_image: null,
      farm_location: "string",
      farm_size: "0 acres",
      years_experience: 0,
    };

    try {
      const res = await axios.post(
        endpoints().users.create_farmer_profile,
        payload,
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className={modalOverlayClass}>
      <div className={modalPanelClass}>
        <h2 className={titleClass}>Let&apos;s get to know you</h2>
        <p className={subtitleClass}>
          Please provide your basic details to help us set up your account. This
          helps us keep our farmer community safe and trustworthy.
        </p>

        {/* Profile Image */}
        <div className="mt-6 flex flex-col items-center">
          <img
            src={image || customerPhoto}
            alt="Profile"
            className="h-24 w-24 rounded-full border-4 border-grey-100 object-cover sm:h-28 sm:w-28"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
            aria-label="Upload profile photo"
          />
          <button
            type="button"
            onClick={handleEditClick}
            className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            Edit
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="First Name" htmlFor="farmer-first-name" required>
              <input
                id="farmer-first-name"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                className={inputClass}
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </FormField>
            <FormField label="Last Name" htmlFor="farmer-last-name" required>
              <input
                id="farmer-last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                className={inputClass}
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </FormField>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Email" htmlFor="farmer-email">
              <input
                id="farmer-email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className={inputClass}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormField>
            <FormField label="Phone Number" htmlFor="farmer-phone" required>
              <div className="flex h-12 w-full items-center rounded-lg border border-grey-100 bg-white transition-colors focus-within:border-primary">
                <span
                  className="flex h-full items-center rounded-l-lg border-r border-grey-100 bg-gray-50 px-3 text-xl"
                  aria-hidden="true"
                >
                  🇳🇬
                </span>
                <input
                  id="farmer-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08022222222"
                  className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent px-4 text-base text-text-neutral placeholder:text-grey-200 focus:outline-none"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </FormField>
          </div>

          {/* Gender */}
          <fieldset>
            <legend className={labelClass}>
              Gender<span className="ml-0.5 text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-4">
              {genderOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-grey-100 px-4 text-base transition-colors focus-within:border-primary"
                >
                  <input
                    type="radio"
                    name="gender"
                    className="h-4 w-4 accent-primary"
                    required
                    checked={formData.gender === value}
                    onChange={() => setFormData({ ...formData, gender: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Address */}
          <FormField label="Address" htmlFor="farmer-address" required>
            <textarea
              id="farmer-address"
              autoComplete="street-address"
              placeholder="123 Example Street, Ikeja, Lagos."
              className={textareaClass}
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </FormField>

          <Button
            type="submit"
            className={primaryButtonClass}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
