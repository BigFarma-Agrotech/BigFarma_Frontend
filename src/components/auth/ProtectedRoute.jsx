import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearSession, getAccessToken, isAuthenticated } from "@/lib/auth";

// Wraps routes that need a signed-in user; sends everyone else to sign-in
// and remembers where they were headed.
const ProtectedRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    const hadSession = Boolean(getAccessToken());
    if (hadSession) clearSession();
    const from = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={hadSession ? "/sign-in?expired=1" : "/sign-in"}
        state={{ from }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
