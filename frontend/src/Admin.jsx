import React, { useEffect } from "react";
import { getDashboardPath } from "./utils/dashboardPath";

export default function Admin() {
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile") || "null");
    window.location.href = getDashboardPath(profile);
  }, []);

  return null;
}

