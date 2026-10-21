import { useState } from "react";

const initialLoginData = {
  username: "",
  password: "",
  country: null,
  rememberMe: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;

// Validation rules for each field. Returns an error message or "".
const fieldValidators = {
  username: (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) return "Email or phone number is required";
    const isEmail = emailRegex.test(trimmed);
    const isPhone = phoneRegex.test(trimmed.replace(/\s/g, ""));
    if (!isEmail && !isPhone) {
      return "Please enter a valid email or phone number";
    }
    return "";
  },
  password: (value = "") => (value ? "" : "Password is required"),
};

const useForm = () => {
  const [loginData, setLoginData] = useState(initialLoginData);
  const [errors, setErrors] = useState({});

  // Update any field
  const updateField = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Update country specifically
  const updateCountry = (country) => {
    setLoginData((prev) => ({
      ...prev,
      country: country,
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setLoginData(initialLoginData);
    setErrors({});
  };

  // Validate a single field (e.g. on blur). Returns true when valid.
  const validateField = (field) => {
    const validator = fieldValidators[field];
    if (!validator) return true;
    const message = validator(loginData[field]);
    setErrors((prev) => ({ ...prev, [field]: message }));
    return !message;
  };

  // Validate every field (e.g. on submit). Returns true when valid.
  const validateForm = () => {
    const newErrors = {};
    Object.entries(fieldValidators).forEach(([field, validator]) => {
      const message = validator(loginData[field]);
      if (message) newErrors[field] = message;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return null;
    }
    return loginData;
  };

  // Get form data
  const getFormData = () => loginData;

  // Check if form is valid
  const isValid = () => {
    return loginData.username.trim() && loginData.password.length >= 8;
  };

  return {
    // Data
    loginData,
    errors,

    // Actions
    updateField,
    updateCountry,
    resetForm,
    validateField,
    validateForm,
    handleSubmit,
    getFormData,
    isValid,
  };
};

export default useForm;
