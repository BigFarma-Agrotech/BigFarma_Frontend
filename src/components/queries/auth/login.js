import { endpoints } from '@/components/config/endpoints';
import { setSession } from '@/lib/auth';
import { authRequest } from './request';

// Response body is the API's Token schema:
// { access_token, refresh_token, token_type, user_category, profile_setup }
const login = async ({ login, password, remember = false }) => {
  const result = await authRequest(
    endpoints().auth.login,
    { login: login.trim(), password },
    { successMessage: 'Login successful!', errorMessage: 'Login failed. Please try again.' }
  );

  if (!result.isSuccess) return result;

  if (!result.data?.access_token) {
    return {
      ...result,
      isSuccess: false,
      message: 'The server did not return an access token. Please try again.',
    };
  }

  setSession(result.data, { remember });

  return {
    ...result,
    role: result.data.user_category,
    profileSetup: result.data.profile_setup,
  };
};

export { login };
