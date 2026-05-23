import { useMemo } from "react";
import { getDashboardPath } from "../utils/dashboardPath";
import { getProfile, getToken } from "../utils/tokenManager";

export function useAuth() {
  const token = getToken();
  const profile = getProfile();

  return useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: Boolean(token && profile),
      dashboardPath: getDashboardPath(profile),
    }),
    [token, profile]
  );
}

export default useAuth;
