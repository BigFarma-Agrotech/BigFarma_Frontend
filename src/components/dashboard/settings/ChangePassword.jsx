import { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import SuccessModal from "./Success";
import { changePassword, FeatureUnavailableError } from "../../../lib/pendingApi";

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password validation rules
  const rules = {
    uppercase: /[A-Z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    length: formData.newPassword.length >= 8,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched(true);
  };

  const handleDiscard = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTouched(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (
      !(rules.uppercase && rules.number && rules.length) ||
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      handleDiscard();
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (error instanceof FeatureUnavailableError) {
        toast.info(error.message);
      } else {
        toast.error(
          error.response?.data?.message || "Couldn't update your password."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStrengthColor = () => {
    const passed = Object.values(rules).filter(Boolean).length;
    return (
      ["bg-red-500", "bg-yellow-400", "bg-green-500"][
        Math.min(passed - 1, 2)
      ] || "bg-gray-200"
    );
  };

  const passedCount = Object.values(rules).filter(Boolean).length;
  const allPassed = passedCount === 3;

  const passwordFields = [
    { key: "current", name: "currentPassword", label: "Current Password" },
    { key: "new", name: "newPassword", label: "New Password" },
    { key: "confirm", name: "confirmPassword", label: "Confirm New Password" },
  ];

  const ruleItems = [
    { passed: rules.uppercase, label: "At least 1 uppercase" },
    { passed: rules.number, label: "At least 1 number" },
    { passed: rules.length, label: "At least 8 characters" },
  ];

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Change your password
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Update password for enhanced account security.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {passwordFields.map((field) => {
            const isShown = showPassword[field.key];
            const inputId = `password-${field.key}`;
            return (
              <div key={field.key}>
                <label
                  htmlFor={inputId}
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={inputId}
                    type={isShown ? "text" : "password"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 text-base text-gray-900 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        [field.key]: !prev[field.key],
                      }))
                    }
                    aria-label={isShown ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500"
                  >
                    {isShown ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            );
          })}

          {touched && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {ruleItems.map((rule) => (
                  <div
                    key={rule.label}
                    className={`h-1 flex-1 rounded ${
                      rule.passed ? getStrengthColor() : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p
                className={`text-sm ${
                  allPassed
                    ? "text-green-600"
                    : passedCount >= 2
                    ? "text-yellow-600"
                    : "text-red-500"
                }`}
              >
                {allPassed
                  ? "Strong password 💪"
                  : passedCount >= 2
                  ? "Moderate password — improve it for better security"
                  : "Weak password. Must contain:"}
              </p>

              <ul className="space-y-1 text-sm text-gray-700">
                {ruleItems.map((rule) => (
                  <li key={rule.label} className="flex items-center gap-2">
                    {rule.passed ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-gray-400" size={16} />
                    )}
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleDiscard}
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

      <SuccessModal
        message="Congratulations your password has been successfully changed"
        isOpen={isSuccessModalOpen}
        path="/dashboard"
      />
    </>
  );
};

export default ChangePassword;
