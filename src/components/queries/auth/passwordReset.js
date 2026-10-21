import { endpoints } from '@/components/config/endpoints';
import { authRequest, contactFields } from './request';

// payload: { identifier, new_password }
const passwordReset = ({ identifier, new_password }) =>
  authRequest(
    endpoints().auth.password_reset,
    { ...contactFields(identifier), new_password },
    { successMessage: 'Password updated successfully!', errorMessage: 'Failed to update password.' }
  );

export { passwordReset };
