import React, { useState } from 'react';
import arrowLeft from '../../assets/icons/arrow_left.svg';
import supportIcon from '../../assets/icons/Support_Icon .png';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { EyeOff, Eye } from 'lucide-react';
import Support from './Support';
import { passwordReset } from '@/components/queries/auth/passwordReset';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPasswordForm = () => {
  const location = useLocation();
  // Set by VerifyOtpForm once the reset code has been verified
  const identifier = location.state?.identifier;
  const verified = location.state?.verified;
  const [showSupport, setShowSupport] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Only reachable after verifying a reset code
  if (!identifier || !verified) {
    return <Navigate to="/forgot-password" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      password: true,
      confirmPassword: true,
    });

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const result = await passwordReset({ identifier, new_password: password });
    setLoading(false);

    if (!result.isSuccess) {
      const { new_password } = result.fieldErrors;
      if (new_password) setErrors({ password: new_password });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    navigate("/sign-in", { replace: true });
  };

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-gray-100 ">
      <div className=" h-full p-6 flex items-center justify-center flex-col">
        <div className="md:max-w-[800px] w-full">
          {/* Back button */}
          <div>
            <NavLink
              to="/sign-in"
              className="flex items-center gap-2 cursor-pointer mb-8"
            >
              <img src={arrowLeft} alt="Back" />
              <p>Back</p>
            </NavLink>
          </div>

          {/* Title */}
          <div>
            <span className="text-[32px] font-bold leading-tight">
              Set a new password
            </span>
            <p className="text-[18px] font-normal pt-5">
              Create a new password. Ensure it differs from previous ones for
              security
            </p>
          </div>

          {/* Form */}
          <form className="w-full h-auto mt-10" onSubmit={handleFormSubmit}>
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Password
              </label>
              <div
                className={`flex items-center border rounded-md px-3 ${
                  touched.password && errors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  id="password"
                  placeholder="Must be 8 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className="w-full bg-white focus:outline-none py-2"
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </div>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-gray-700 mb-1 mt-8"
              >
                Confirm Password
              </label>
              <div
                className={`flex items-center border rounded-md px-3 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  id="confirmPassword"
                  placeholder="Repeat password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    setTouched({ ...touched, confirmPassword: true })
                  }
                  className="w-full bg-white focus:outline-none py-2"
                />
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  {confirmPasswordVisible ? <Eye /> : <EyeOff />}
                </div>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg mt-8 font-normal text-[22px] bg-[#DDD5DD] text-[#3C3C3C] hover:bg-green-700 hover:text-white hover:font-bold cursor-pointer transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Support icon */}
      <div className="relative self-end p-[40px] cursor-pointer">
        <img
          src={supportIcon}
          alt="supportIcon"
          className="w-[40px] h-[40px] self-end"
          onClick={() => setShowSupport(true)}
        />
        <Support show={showSupport} onClose={() => setShowSupport(false)} />
      </div>
    </section>
  );
};

export default ResetPasswordForm;
