import React from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/home/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/RequestOrganisation";
import RequestOrganisation from "./pages/auth/RequestOrganisation";
import OrganisationLogin from "./pages/auth/OrganisationLogin";
import ModuleCenter from "./pages/modules/ModuleCenter";
import ModuleDetail from "./pages/modules/ModuleDetail";
import RolePermissions from "./pages/modules/RolePermissions";
import SuperadminDashboard from "./pages/dashboard/SuperadminDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SchoolDashboard from "./pages/dashboard/SchoolDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
import AccountantDashboard from "./pages/dashboard/AccountantDashboard";
import LibrarianDashboard from "./pages/dashboard/LibrarianDashboard";
import RegisterSchool from "./pages/auth/RegisterSchool";
import { getDashboardPath } from "./utils/dashboardPath";
import "./styles.css";
import ClassroomsDashboard from "./pages/dashboard/ClassroomsDashboard";
import StudentsDashboard from "./pages/dashboard/StudentsDashboard";
import TeachersDashboard from "./pages/dashboard/TeachersDashboard";
import ClassDetails from "./pages/dashboard/ClassDetails";

const Root = () => {
  const [path, setPath] = React.useState(window.location.pathname);
  const profile =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("profile") || "null")
      : null;

  React.useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  React.useEffect(() => {
    if (path === "/signup") {
      window.location.href = "/register-school";
    }
  }, [path]);

  // Handle redirects in useEffect instead of render
  React.useEffect(() => {
    if (path === "/user") {
      const dashboardPath = getDashboardPath(profile);
      if (dashboardPath) {
        window.location.href = dashboardPath;
      }
    }
  }, [path, profile]);

  // Don't render anything while redirecting
  if (path === "/signup" || path === "/user") {
    return null;
  }

  return (
    <div>
      {path === "/classrooms-dashboard" && <ClassroomsDashboard />}
      {path === "/students-dashboard" && <StudentsDashboard />}
      {path === "/teachers-dashboard" && <TeachersDashboard />}
      {path.startsWith("/class-details/") && <ClassDetails />}
      {path === "/dashboard/superadmin" && <SuperadminDashboard />}
      {path === "/dashboard/admin" && <AdminDashboard />}
      {path === "/dashboard/school" && <SchoolDashboard />}
      {path === "/dashboard/teacher" && <TeacherDashboard />}
      {path === "/dashboard/student" && <StudentDashboard />}
      {path === "/dashboard/parent" && <ParentDashboard />}
      {path === "/dashboard/accountant" && <AccountantDashboard />}
      {path === "/dashboard/librarian" && <LibrarianDashboard />}

      {path === "/admin/role-permissions" && <RolePermissions />}
      {path.startsWith("/admin") && <SchoolDashboard />} 
      {path === "/login" && <OrganisationLogin />}
      {path === "/login/credentials" && <Login />}
      {path === "/register-school" && <RegisterSchool />}
      {path === "/modules" && <ModuleCenter />}
      {path.startsWith("/modules/") && (
        <ModuleDetail slug={path.replace("/modules/", "").trim()} />
      )}
      {path === "/" && <App />}
    </div>
  );
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);