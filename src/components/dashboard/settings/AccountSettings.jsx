import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../config/endpoints";
import { axios } from "../../../lib/axios";
import { parseApiError } from "@/lib/apiError";
import { useUserProfile, userProfileKey } from "@/hooks/useUserProfile";
import Button from "@/components/shared/Button";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  // Farmer only
  farmName: "",
  farmLocation: "",
  farmType: "",
  farmSize: "",
  farmSizeUnit: "acres",
  yearsExperience: "",
};

const SIZE_UNITS = ["sqm", "hectares", "acres"];

const FARM_TYPES = [
  { value: "crop", label: "Crop Farm" },
  { value: "livestock", label: "Livestock Farm" },
  { value: "mixed", label: "Mixed Farm" },
];

// Profile setup's first step saves "string" for farm fields the farmer hasn't
// filled in yet; show those as empty rather than as a literal "string"
const realValue = (value) => (value && value !== "string" ? value : "");

// "5 acres" -> { farmSize: "5", farmSizeUnit: "acres" }
const splitFarmSize = (value) => {
  const match = realValue(value).match(/^\s*(\S+)\s*(sqm|hectares|acres)?\s*$/i);
  if (!match) return { farmSize: realValue(value), farmSizeUnit: "acres" };
  return {
    farmSize: match[1],
    farmSizeUnit: match[2]?.toLowerCase() || "acres",
  };
};

// Maps GET /users/profile onto the form, plus the photos it shows
const toFormState = (user) => {
  const farmer = user?.farmer_profile;
  const consumer = user?.consumer_profile;
  const base = {
    ...EMPTY_FORM,
    email: user?.email || "",
    phone: user?.phone_number || "",
  };

  if (farmer) {
    const [firstName = "", ...rest] = (farmer.full_name || "").trim().split(/\s+/);
    return {
      form: {
        ...base,
        firstName,
        lastName: rest.join(" "),
        address: farmer.home_address || "",
        farmName: realValue(farmer.farm_name),
        farmLocation: realValue(farmer.farm_location),
        farmType: farmer.farm_type || "",
        ...splitFarmSize(farmer.farm_size),
        yearsExperience: farmer.years_experience ?? "",
      },
      image: farmer.profile_picture || "",
      farmImage: farmer.farm_image || "",
    };
  }

  if (consumer) {
    return {
      form: {
        ...base,
        firstName: consumer.first_name || "",
        lastName: consumer.last_name || "",
        address: consumer.address || "",
      },
      image: consumer.profile_picture || "",
      farmImage: "",
    };
  }

  return { form: base, image: "", farmImage: "" };
};

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AccountSettings = () => {
  const role = Cookies.get("BIGFARMA_ROLE");
  const isFarmer = role === "farmer";
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUserProfile();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [profileImage, setProfileImage] = useState(""); // base64 data URL
  const [farmImage, setFarmImage] = useState(""); // base64 data URL
  const [isSaving, setIsSaving] = useState(false);

  // Last values loaded from the server, used by "Discard Changes"
  const saved = toFormState(user);

  // Fill the form whenever the server copy changes (first load, after save)
  useEffect(() => {
    const next = toFormState(user);
    setFormData(next.form);
    setProfileImage(next.image);
    setFarmImage(next.farmImage);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = (setter) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    try {
      setter(await readAsDataUrl(file));
    } catch {
      toast.error("Couldn't read the selected photo. Please try another.");
    }
  };

  const handleResetForm = () => {
    setFormData(saved.form);
    setProfileImage(saved.image);
    setFarmImage(saved.farmImage);
  };

  // Mirrors the backend's FarmerProfileUpdate / ConsumerProfileUpdate limits
  const validate = () => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const address = formData.address.trim();

    if (!firstName || !lastName) return "Please enter your first and last name.";
    if (firstName.length < 2 || lastName.length < 2)
      return "First and last name must be at least 2 characters.";
    if (!formData.phone.trim()) return "Please enter your phone number.";
    if (address && address.length < 5)
      return "Address must be at least 5 characters.";

    if (isFarmer) {
      const location = formData.farmLocation.trim();
      const years = String(formData.yearsExperience).trim();
      if (formData.farmName.trim() && formData.farmName.trim().length < 2)
        return "Farm name must be at least 2 characters.";
      if (location && location.length < 5)
        return "Farm location must be at least 5 characters.";
      if (years && !(Number.isInteger(Number(years)) && Number(years) >= 0))
        return "Years of experience must be a whole number.";
    }
    return null;
  };

  // Only send fields that have a value, so blanks don't overwrite saved data
  // or trip the backend's minimum lengths
  const buildPayload = () => {
    const optional = (value) => (String(value).trim() ? String(value).trim() : undefined);
    const common = {
      address: optional(formData.address),
      email: optional(formData.email),
      phone: formData.phone.trim(),
      profile_picture: profileImage || null,
    };

    if (!isFarmer) {
      return {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        ...common,
      };
    }

    const { address, ...rest } = common;
    const size = formData.farmSize.trim();
    const years = String(formData.yearsExperience).trim();
    return {
      full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      home_address: address,
      ...rest,
      farm_name: optional(formData.farmName),
      farm_location: optional(formData.farmLocation),
      farm_type: formData.farmType || undefined,
      farm_size: size ? `${size} ${formData.farmSizeUnit}` : undefined,
      years_experience: years ? Number(years) : undefined,
      farm_image: farmImage || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(
        isFarmer
          ? endpoints().users.update_farmer_profile
          : endpoints().users.update_consumer_profile,
        buildPayload(),
      );
      // Refreshes this form and the header greeting/avatar
      await queryClient.invalidateQueries({ queryKey: userProfileKey });
      toast.success("Changes saved successfully");
    } catch (err) {
      toast.error(parseApiError(err, "Profile update failed").message);
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
  const fieldClass =
    "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";
  const cardClass = "rounded-xl border border-gray-200 bg-white p-4 sm:p-6";
  const uploadButtonClass =
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-primary bg-white px-4 text-base font-medium text-primary transition-colors hover:bg-primary-subtle";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="Profile"
            className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">Upload A New Photo</p>
            <p className="truncate text-sm text-gray-500">
              {profileImage ? "Current profile photo" : "No photo yet"}
            </p>
          </div>
        </div>
        <input
          type="file"
          id="profile-photo-input"
          accept="image/*"
          className="sr-only"
          onChange={pickImage(setProfileImage)}
        />
        <label htmlFor="profile-photo-input" className={uploadButtonClass}>
          Update
        </label>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Change User Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-first-name" className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="settings-first-name"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="settings-last-name" className={labelClass}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="settings-last-name"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="settings-email" className={labelClass}>
              Email
            </label>
            <input
              type="email"
              id="settings-email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="settings-phone" className={labelClass}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="settings-phone"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="settings-address" className={labelClass}>
              Address
            </label>
            <textarea
              id="settings-address"
              name="address"
              rows="3"
              autoComplete="street-address"
              value={formData.address}
              onChange={handleChange}
              className={`${fieldClass} h-auto resize-y py-3`}
            />
          </div>
        </div>
      </div>

      {isFarmer && (
        <div className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Farm Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="settings-farm-name" className={labelClass}>
                Farm Name
              </label>
              <input
                type="text"
                id="settings-farm-name"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="settings-farm-location" className={labelClass}>
                Farm Location
              </label>
              <input
                type="text"
                id="settings-farm-location"
                name="farmLocation"
                placeholder="Lagos, Nigeria"
                value={formData.farmLocation}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="settings-farm-size" className={labelClass}>
                Farm Size
              </label>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-300 bg-white focus-within:border-primary-light focus-within:ring-1 focus-within:ring-primary-light">
                <input
                  type="text"
                  inputMode="decimal"
                  id="settings-farm-size"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="h-full min-w-0 flex-1 rounded-l-lg bg-transparent px-4 text-base text-gray-900 focus:outline-none"
                />
                <select
                  name="farmSizeUnit"
                  aria-label="Farm size unit"
                  value={formData.farmSizeUnit}
                  onChange={handleChange}
                  className="h-full shrink-0 rounded-r-lg border-l border-gray-300 bg-gray-50 px-2 text-base text-gray-700 focus:outline-none"
                >
                  {SIZE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="settings-farm-type" className={labelClass}>
                Farm Type
              </label>
              <select
                id="settings-farm-type"
                name="farmType"
                value={formData.farmType}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="">Select farm type</option>
                {FARM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-years" className={labelClass}>
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                id="settings-years"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {farmImage ? (
                  <img
                    src={farmImage}
                    alt="Farm"
                    className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
                    No photo
                  </div>
                )}
                <p className="font-semibold text-gray-900">Farm Photo</p>
              </div>
              <input
                type="file"
                id="farm-photo-input"
                accept="image/*"
                className="sr-only"
                onChange={pickImage(setFarmImage)}
              />
              <label htmlFor="farm-photo-input" className={uploadButtonClass}>
                {farmImage ? "Change" : "Upload"}
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetForm}
          className="h-12 w-full py-0"
        >
          Discard Changes
        </Button>
        <Button type="submit" disabled={isSaving} className="h-12 w-full py-0">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default AccountSettings;
