import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { endpoints } from "../../config/endpoints";
import { axios } from "../../../lib/axios";
import { toast } from "react-toastify";
import axiosDefault from "axios";
import Button from "@/components/shared/Button";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "gender",
  address: "",
};

const AccountSettings = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  // Last values loaded from / saved to the server, used by "Discard Changes"
  const [savedData, setSavedData] = useState({ form: EMPTY_FORM, image: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [profileImage, setProfileImage] = useState(""); // will store base64 string
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("BIGFARMA_ACCESS_TOKEN");
  const role = Cookies.get("BIGFARMA_ROLE");

  useEffect(() => {
    const applyLoaded = (form, image) => {
      setFormData(form);
      setProfileImage(image);
      setImagePreview(image);
      setSavedData({ form, image });
    };

    const fetchProfileDetails = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        let response;
        if (role === "farmer") {
          response = await axios.get(endpoints().users.get_farmer_profile, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data;
          const [firstName = "", ...rest] = (data.full_name || "").trim().split(/\s+/);

          applyLoaded(
            {
              firstName,
              lastName: rest.join(" "),
              email: data.email || "",
              phone: data.phone || "",
              address: data.home_address || "",
              gender: data.gender || "gender",
            },
            data.profile_picture || ""
          );
        } else if (role === "consumer") {
          response = await axios.get(endpoints().users.get_consumer_profile, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data;
          applyLoaded(
            {
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              gender: data.gender || "gender",
            },
            data.profile_picture || ""
          );
        }
      } catch {
        // Keep the empty form; the user can still fill it in
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [role, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Convert uploaded image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result; // backend expects string
      setProfileImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleResetForm = () => {
    setFormData(savedData.form);
    setProfileImage(savedData.image);
    setImagePreview(savedData.image);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gender = formData.gender === "gender" ? undefined : formData.gender;

    const farmerPayload = {
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      gender,
      home_address: formData.address,
      email: formData.email,
      phone: formData.phone,
      profile_picture: profileImage || null, // base64 string
    };

    const consumerPayload = {
      first_name: formData.firstName,
      gender,
      last_name: formData.lastName,
      address: formData.address,
      profile_picture: profileImage || null, // base64 string
      email: formData.email,
      phone: formData.phone,
    };

    setIsSaving(true);
    try {
      if (role === "farmer") {
        await axios.put(
          endpoints().users.update_farmer_profile,
          farmerPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (role === "consumer") {
        await axios.put(
          endpoints().users.update_consumer_profile,
          consumerPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // axios rejects non-2xx responses, so reaching here means success
      setSavedData({ form: formData, image: profileImage });
      toast.success("Changes saved successfully");
      // Reload so the header picks up the new name and photo
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      if (axiosDefault.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Profile update failed");
      } else {
        toast.error("Unable to connect to the server");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
  const fieldClass =
    "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={
              imagePreview ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="Profile"
            className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">Upload A New Photo</p>
            <p className="truncate text-sm text-gray-500">
              {profileImage ? "Selected Image" : "Profile.pic.jpg"}
            </p>
          </div>
        </div>
        <input
          type="file"
          id="profile-photo-input"
          accept="image/*"
          className="sr-only"
          onChange={handleImageChange}
        />
        <label
          htmlFor="profile-photo-input"
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-primary bg-white px-4 text-base font-medium text-primary transition-colors hover:bg-primary-subtle"
        >
          Update
        </label>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Change User Information
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-first-name" className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="settings-first-name"
              name="firstName"
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
              value={formData.phone}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="settings-gender" className={labelClass}>
              Gender
            </label>
            <select
              id="settings-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="gender">Select Gender</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="settings-address" className={labelClass}>
              Address
            </label>
            <textarea
              id="settings-address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className={`${fieldClass} h-auto resize-y py-3`}
            />
          </div>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
            <Button
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
      </div>
    </div>
  );
};

export default AccountSettings;
