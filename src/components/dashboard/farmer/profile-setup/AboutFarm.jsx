import { useState } from "react";
import { toast } from "react-toastify";
import axiosDefault from "axios";
import { X } from "lucide-react";
import Button from "@/components/shared/Button";
import { FormField } from "@/components/auth/AuthUI";
import {
  inputClass,
  labelClass,
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  subtitleClass,
  titleClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";
import fileIcon from "@/assets/icons/fileIcon.png";
import { endpoints } from "../../../config/endpoints";
import { axios } from "../../../../lib/axios";
import { parseApiError } from "@/lib/apiError";

const AboutFarm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    size: "",
    sizeUnit: "acres",
    farmType: "",
    experience: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The payload has a single farm_image field, so keep one photo at a time.
  const selectImage = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFormData((prev) => ({ ...prev, images: [file] }));
    setImagePreviews([URL.createObjectURL(file)]);
  };

  const handleFileUpload = (e) => {
    selectImage(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    selectImage(e.dataTransfer?.files?.[0]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // helper to convert file → base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const missing = [
      !formData.farmName.trim() && "farm name",
      !formData.location.trim() && "farm location",
      !String(formData.size).trim() && "farm size",
      !formData.farmType && "farm type",
      formData.experience === "" && "years of experience",
    ].filter(Boolean);

    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    // Backend limits (FarmerProfileUpdate): farm_location >= 5 chars
    if (formData.location.trim().length < 5) {
      toast.error("Farm location must be at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert the photo to base64 (if one was chosen)
      const farmImageBase64 =
        formData.images.length > 0 ? await toBase64(formData.images[0]) : null;

      const payload = {
        farm_name: formData.farmName.trim(),
        farm_location: formData.location.trim(),
        farm_type: formData.farmType,
        // Same "<amount> <unit>" string format BioData sends (e.g. "0 acres")
        farm_size: `${String(formData.size).trim()} ${formData.sizeUnit}`,
        years_experience: Number(formData.experience),
        farm_image: farmImageBase64, // string | null
      };

      const res = await axios.put(
        endpoints().users.update_farmer_profile,
        payload,
      );

      const data = res.data;
      if (res.status === 200 || res.status === 201) {
        toast.success(data?.message || "Saved successfully!");
        onNext(data);
      } else {
        toast.error(data?.message || "Network error. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      if (axiosDefault.isAxiosError(error)) {
        toast.error(parseApiError(error, "Profile setup failed").message);
      } else {
        toast.error("Couldn't read the selected photo. Please try another.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={modalOverlayClass}>
      <div className={cn(modalPanelClass, "max-w-2xl")}>
        <h2 className={titleClass}>Tell us about your farm</h2>
        <p className={subtitleClass}>
          Share a few details so buyers know more about where their produce
          comes from. The more accurate your farm profile, the better your
          visibility.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormField label="Farm Name" htmlFor="farmName">
            <input
              id="farmName"
              type="text"
              name="farmName"
              placeholder="John Doe"
              value={formData.farmName}
              onChange={handleInputChange}
              className={inputClass}
            />
          </FormField>

          <FormField label="Farm Location" htmlFor="farmLocation">
            <input
              id="farmLocation"
              type="text"
              name="location"
              placeholder="Lagos, Nigeria"
              value={formData.location}
              onChange={handleInputChange}
              className={inputClass}
            />
          </FormField>

          {/* Size and Farm Type */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Farm Size" htmlFor="farmSize">
              <div className="flex h-12 w-full items-center rounded-lg border border-grey-100 bg-white transition-colors focus-within:border-primary">
                <input
                  id="farmSize"
                  type="text"
                  name="size"
                  placeholder="How big is your farm?"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="h-full min-w-0 flex-1 rounded-l-lg bg-transparent px-4 text-base text-text-neutral placeholder:text-grey-200 focus:outline-none"
                />
                <select
                  name="sizeUnit"
                  id="sizeUnit"
                  aria-label="Farm size unit"
                  value={formData.sizeUnit}
                  onChange={handleInputChange}
                  className="h-full shrink-0 rounded-r-lg border-l border-grey-100 bg-gray-50 px-2 text-base text-grey-300 focus:outline-none"
                >
                  <option value="sqm">sqm</option>
                  <option value="hectares">hectares</option>
                  <option value="acres">acres</option>
                </select>
              </div>
            </FormField>
            <FormField label="Farm Type" htmlFor="farmType">
              <select
                id="farmType"
                name="farmType"
                value={formData.farmType}
                onChange={handleInputChange}
                className={cn(inputClass, "text-grey-300")}
              >
                <option value="">What kind of farm do you run?</option>
                <option value="crop">Crop Farm</option>
              </select>
            </FormField>
          </div>

          {/* Years of Experience */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Years of Experience" htmlFor="experience">
              <input
                id="experience"
                type="number"
                min="0"
                name="experience"
                inputMode="numeric"
                placeholder="e.g. 5"
                value={formData.experience}
                onChange={handleInputChange}
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Upload Images */}
          <div>
            <p className={labelClass}>
              Upload a photo so buyers can see where your produce grows
            </p>
            <label
              htmlFor="fileUpload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-grey-100 p-6 text-center transition-colors hover:border-primary"
            >
              <img src={fileIcon} alt="" className="mb-3" />
              <span className="text-sm text-grey-300">
                Drag and drop a file here, or{" "}
                <span className="ml-1 inline-block rounded bg-grey-100 px-2 py-0.5 font-medium text-text-neutral">
                  browse
                </span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Farm.Image.${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral shadow"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <p className="mt-1 text-xs text-grey-300">
                    Farm.Image.{index + 1}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className={primaryButtonClass}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Farm Details"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AboutFarm;
