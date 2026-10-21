import { axios } from '@/lib/axios';
import { parseApiError } from '@/lib/apiError';

/**
 * POSTs to an auth endpoint and returns a uniform result. Never throws.
 * `message` is the server's own message (success or error) when it sends one.
 */
export const authRequest = async (endpoint, payload, { successMessage, errorMessage }) => {
  try {
    const response = await axios.post(endpoint, payload);
    const body = response.data ?? {};
    return {
      isSuccess: true,
      statusCode: response.status,
      message: body.message || body.detail || successMessage,
      data: body,
      fieldErrors: {},
    };
  } catch (error) {
    const { status, message, fieldErrors } = parseApiError(error, errorMessage);
    return {
      isSuccess: false,
      statusCode: status,
      message,
      data: null,
      fieldErrors,
    };
  }
};

// The API takes either an email or a phone number, plus the matching medium.
// Unused fields are omitted: an empty string fails the server's email validation.
export const contactFields = (identifier = '') => {
  const value = identifier.trim();
  return value.includes('@')
    ? { email: value, medium: 'email' }
    : { phone: value, medium: 'phone' };
};
