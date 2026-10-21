import { useState } from "react";
import { FocusContext } from "./FocusContext";
import Cookies from "js-cookie";
import { getRole, ROLE_KEY } from "@/lib/auth";

// Provider
export const FocusProvider = ({ children }) => {
  const [focused, setFocused] = useState(false);
  // Role comes from the session cookie, or from role selection before sign-up
  const [role, setRole] = useState(getRole);

  // Keep the cookie in sync so the role survives a page refresh. Skip the write
  // when it already matches so the expiry set at sign-in is preserved.
  const updateRole = (newRole) => {
    setRole(newRole);
    if (!newRole) {
      Cookies.remove(ROLE_KEY);
    } else if (getRole() !== newRole) {
      Cookies.set(ROLE_KEY, newRole, { sameSite: "lax" });
    }
  };

  return (
    <FocusContext.Provider
      value={{
        focused,
        setFocused,
        role,
        setRole: updateRole, // expose updateRole as setRole
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};
