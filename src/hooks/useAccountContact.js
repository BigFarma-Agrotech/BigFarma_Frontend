import { useUserProfile } from "./useUserProfile";

// The email and phone number already on the signed-in user's account.
// Profile setup forms prefill these and lock the ones that exist.
export const useAccountContact = () => {
  const { data, isLoading } = useUserProfile();

  return {
    email: data?.email?.trim() || "",
    phone: data?.phone_number?.trim() || "",
    isLoading,
  };
};

export default useAccountContact;
