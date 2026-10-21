import { useState } from "react";


const useForm = () => {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    country: null,
    rememberMe: false,
  });

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
    setLoginData({
      username: "",
      password: "",
      country: null,
      rememberMe: false,
    });
    setErrors({});
  };

  // Basic validation
  const validateForm = () => {
    const newErrors = {};

    // Email or phone validation
    if (!loginData.username.trim()) {
      newErrors.username = "Email or phone number is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?\d{7,15}$/;

      const isEmail = emailRegex.test(loginData.username.trim());
      const isPhone = phoneRegex.test(
        loginData.username.trim().replace(/\s/g, "")
      );

      if (!isEmail && !isPhone) {
        newErrors.username = "Please enter a valid email or phone number";
      }
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form has errors:", errors);
      return null;
    }
    try {
      // console.log("Form submitted with data:", loginData);
      return loginData; //successful submission
    } catch (error) {
      // console.error("Form submission error:", error);
      setErrors({ submit: error.message || "Failed to submit form" });
      return null;
    }
  };

  // Show errors returned by the server, e.g. { username: "Invalid email" }
  const setFieldErrors = (fieldErrors) => {
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
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
    handleSubmit,
    setFieldErrors,
    getFormData,
    isValid,
  };
};

export default useForm;
