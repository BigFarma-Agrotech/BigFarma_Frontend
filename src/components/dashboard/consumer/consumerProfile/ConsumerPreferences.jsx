import { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axiosDefault from "axios";
import Button from "@/components/shared/Button";
import {
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  titleClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";
import { preferences as preferenceOptions } from "../../../../lib/consumerPreference";
import { axios } from "../../../../lib/axios";
import { endpoints } from "../../../config/endpoints";

const ConsumerPreferences = ({ onNext }) => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(false);

  const togglePreference = (id) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handlePreferenceSubmit = async () => {
    if (loading) return;
    const preferencesToSend = selectedPreferences.map(
      (id) => preferenceOptions.find((p) => p.id === id)?.label,
    );
    const dataToSend = {
      crop_preferences:
        preferencesToSend.length > 0 ? preferencesToSend : ["Vegetables"],
    };
    setLoading(true);
    try {
      const res = await axios.put(
        endpoints().users.update_consumer_profile,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("BIGFARMA_ACCESS_TOKEN")}`,
          },
        },
      );
      const data = await res.data;
      if (res.status === 200 || res.status === 201) {
        toast.success(data.message || "Saved successfully!");
        onNext(data);
      } else {
        toast.error(data.message || "Network error. Please try again.");
      }
    } catch (error) {
      // Stay on this step so the user can retry.
      if (axiosDefault.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.detail ||
            error.response.data?.message ||
            "Failed to save your preferences",
        );
      } else {
        toast.error("Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalOverlayClass}>
      <div className={cn(modalPanelClass, "max-w-md text-center")}>
        <h2 className={titleClass}>Choose your favorite product categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {preferenceOptions.map((cat) => {
            const selected = selectedPreferences.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePreference(cat.id)}
                className={cn(
                  "flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium capitalize transition-colors sm:p-4 sm:text-base",
                  selected
                    ? "border-primary bg-primary-subtle text-primary-dark"
                    : "border-grey-100 bg-white hover:border-primary",
                )}
              >
                <img
                  src={cat.profileImage}
                  alt=""
                  className="h-10 w-10 object-contain"
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
        <Button
          onClick={handlePreferenceSubmit}
          className={cn(primaryButtonClass, "mt-8")}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default ConsumerPreferences;
