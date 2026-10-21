import { endpoints } from '@/components/config/endpoints';
import { authRequest, contactFields } from './request';

// payload: { identifier, code, otp_type }
const verifyOtp = ({ identifier, code, otp_type = 'verification' }) =>
  authRequest(
    endpoints().auth.verify_otp,
    { ...contactFields(identifier), code, otp_type },
    { successMessage: 'Code verified successfully!', errorMessage: 'Code verification failed.' }
  );

export { verifyOtp };
