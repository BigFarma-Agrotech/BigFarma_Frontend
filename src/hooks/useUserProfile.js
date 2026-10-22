import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/components/config/endpoints";
import { axios } from "@/lib/axios";

// GET /users/profile: the account (email, phone_number, category) plus the
// nested farmer_profile / consumer_profile. Shared by the header, settings and
// profile setup, so invalidating this key refreshes all of them.
export const userProfileKey = ["user-profile"];

export const useUserProfile = () =>
  useQuery({
    queryKey: userProfileKey,
    queryFn: async () => {
      const response = await axios.get(endpoints().users.profile);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

// First name from whichever profile the user has; "" until they've entered one
export const getFirstName = (user) => {
  const fromFarmer = user?.farmer_profile?.full_name?.trim().split(/\s+/)[0];
  return fromFarmer || user?.consumer_profile?.first_name?.trim() || "";
};

export const getProfilePicture = (user) =>
  user?.farmer_profile?.profile_picture ||
  user?.consumer_profile?.profile_picture ||
  "";

export default useUserProfile;
