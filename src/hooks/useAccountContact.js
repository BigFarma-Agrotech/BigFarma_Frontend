import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/components/config/endpoints";
import { axios } from "@/lib/axios";

// The email and phone number already on the signed-in user's account
// (GET /users/profile returns them as `email` and `phone_number`).
// Profile setup forms prefill these and lock the ones that exist.
export const useAccountContact = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await axios.get(endpoints().users.profile);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    email: data?.email?.trim() || "",
    phone: data?.phone_number?.trim() || "",
    isLoading,
  };
};

export default useAccountContact;
