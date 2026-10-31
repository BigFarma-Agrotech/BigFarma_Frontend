import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/components/config/endpoints";
import { axios } from "@/lib/axios";
import { PROFILE_CACHE_KEY, getTokenUserId } from "@/lib/auth";

// GET /users/profile: the account (email, phone_number, category) plus the
// nested farmer_profile / consumer_profile. Shared by the header, settings and
// profile setup, so invalidating this key refreshes all of them.
export const userProfileKey = ["user-profile"];

// The profile saved from the last visit, if it belongs to whoever is signed in now
const readCachedProfile = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY));
    const userId = getTokenUserId();
    return cached && userId != null && String(cached.userId) === String(userId) ? cached.profile : undefined;
  } catch {
    return undefined;
  }
};

const saveCachedProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId: getTokenUserId(), profile }));
  } catch {
    // Only a speed-up; fine without it
  }
};

// Shows the saved profile instantly (name, avatar) and refreshes it from the
// server in the background
export const useUserProfile = () =>
  useQuery({
    queryKey: userProfileKey,
    queryFn: async () => {
      const response = await axios.get(endpoints().users.profile);
      saveCachedProfile(response.data);
      return response.data;
    },
    initialData: readCachedProfile,
    // Treat the saved copy as old, so a fresh one is always fetched once
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
