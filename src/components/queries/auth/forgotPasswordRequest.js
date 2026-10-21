import { requestOtp } from './register';

// payload: { identifier }
const forgotPasswordRequest = ({ identifier }) =>
  requestOtp({ identifier, otp_type: 'password_reset' });

export { forgotPasswordRequest };
