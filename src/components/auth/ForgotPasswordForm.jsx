import arrowLeft from '../../assets/icons/arrow_left.svg';
import supportIcon from '../../assets/icons/Support_Icon .png';
import { useState } from 'react';
import { forgotPasswordRequest } from '@/components/queries/auth/forgotPasswordRequest';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import Dropdown from '@/components/shared/Dropdown';
import { countries } from '../../lib/countries';
import Support from './Support';

const ForgotPasswordForm = () => {
  const [showSupport, setShowSupport] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ phone: false, country: null });
  const [loading, setLoading] = useState(false);
  // const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  // Country selection
  const updateCountry = (country) => {
    setDropdownOpen(false);
    setTouched((prev) => ({ ...prev, country }));
  };

  const handleDropdownToggle = () => setDropdownOpen(!dropdownOpen);

  const validate = () => {
    const newErrors = {};
    const isPhoneValid = phoneNumber && phoneNumber.length >= 10;

    if (!isPhoneValid) {
      newErrors.phone = 'Please enter a valid phone number or email address.';
    }

    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    setTouched((prev) => ({ ...prev, phone: true }));
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const identifier = phoneNumber.trim();
    setLoading(true);
    const result = await forgotPasswordRequest({ identifier });
    setLoading(false);

    if (!result.isSuccess) {
      const { email, phone } = result.fieldErrors;
      if (email || phone) setErrors({ phone: email || phone });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    navigate('/verify-otp', { state: { identifier } });
  };

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-gray-100 ">
      <div className="h-full p-6 flex items-center justify-center flex-col">
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
              Forgot password
            </span>
            <p className="text-[18px] font-normal pt-5">
              Please enter your email or phone number to reset the password
            </p>
          </div>

          {/* Form */}
          <form className="w-full h-auto mt-10" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="username" className="font-semibold text-base">
                Phone No or Email
              </label>


              <div className="flex">
                <Dropdown
                  countries={countries}
                  onSelect={updateCountry}
                  isOpen={dropdownOpen}
                  onToggle={handleDropdownToggle}
                />
                <input
                  type="text"
                  value={phoneNumber}
                  name="PhoneOrEmail"
                  id="PhoneOrEmail"
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    const newErrors = validate();
                    setErrors((prev) => ({ ...prev, phone: newErrors.phone }));
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, phone: true });
                    const newErrors = validate();
                    setErrors((prev) => ({ ...prev, phone: newErrors.phone }));
                  }}
                  placeholder="Your Phone number or Email"
                  className={`border mb-3 p-2.5 rounded-lg placeholder:text-base placeholder:text-[#98A2B3] relative z-10 w-full cursor-pointer ${
                    touched.phone && errors.phone
                      ? 'border border-red-500'
                      : phoneNumber
                      ? 'border border-green-500'
                      : 'border border-[#DDD5DD]'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
              )}
              {/* <motion.div
                className="flex items-center gap-2 relative"
                initial={false}
                animate={{ marginLeft: focused ? '10px' : '0px' }}
                transition={{ duration: 0.4 }}
              >
                {isPhone ? (
                  <PhoneInput 
                    country={'ng'}
                    value={value}
                    onChange={(phone) => setValue(phone)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                      setFocused(false);
                      setTouched({ ...touched, username: true });
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '0.375rem',
                      border: '1px solid #D1D5DB',
                      padding: '0.5rem',
                    }}
                    containerClass="w-full"
                    placeholder="Enter phone number"
                    inputProps={{ name: 'phone', required: true }}
                    // containerClass="flex-1"
                    inputClass={`w-full py-[25px] rounded-lg placeholder:text-base placeholder:text-[#98A2B3]
                    ${
                      errors.username
                        ? 'border border-red-500'
                        : value
                        ? 'border border-green-500'
                        : 'border border-[#DDD5DD]'
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                      setFocused(false);
                      setTouched({ ...touched, username: true });
                    }}
                    placeholder="Enter email or phone number"
                    className={`border rounded-lg p-2.5 w-full  placeholder:text-base placeholder:text-[#98A2B3]
                    ${
                      errors.username
                        ? 'border-red-500'
                        : value
                        ? 'border-green-500'
                        : 'border-[#DDD5DD]'
                    }`}
                  />
                )}
              </motion.div> */}

              {/* Error message */}
              <AnimatePresence mode="wait">
                {errors.username && (
                  <motion.p
                    key="username-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </AnimatePresence>

            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg mt-8 font-normal text-[22px] bg-[#DDD5DD] text-[#3C3C3C] hover:bg-green-700 hover:text-white hover:font-bold cursor-pointer transition-all duration-300"
            >
              {loading ? 'Sending code...' : 'Reset Password'}
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

export default ForgotPasswordForm;
