import { useMemo } from "react";
import permissionService from "../services/permissions";
import { getProfile } from "../utils/tokenManager";

export function usePermission(module) {
  const profile = getProfile();

  return useMemo(() => {
    if (!profile) {
      return { canRead: false, canWrite: false, profile: null };
    }

    permissionService.setCurrentUser(profile);

    return {
      profile,
      canRead: module ? permissionService.canRead(module) : false,
      canWrite: module ? permissionService.canWrite(module) : false,
    };
  }, [module, profile]);
}

export default usePermission;
