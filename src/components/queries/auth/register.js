import { endpoints } from '@/components/config/endpoints';
import { authRequest, contactFields } from './request';

// payload: { identifier, password, category }
const RegisterMutation = ({ identifier, password, category }) => {
  const { email, phone } = contactFields(identifier);
  return authRequest(
    endpoints().auth.register,
    { ...(email ? { email } : { phone_number: phone }), password, category },
    { successMessage: 'Registration successful!', errorMessage: 'Registration failed.' }
  );
};

// payload: { identifier, otp_type }
const requestOtp = ({ identifier, otp_type }) =>
  authRequest(
    endpoints().auth.requestCode,
    { ...contactFields(identifier), otp_type },
    { successMessage: 'Verification code sent!', errorMessage: 'Failed to send verification code.' }
  );

export { RegisterMutation, requestOtp };
