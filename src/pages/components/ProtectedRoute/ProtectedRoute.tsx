import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  clearSessionStorage,
  hasSessionExpired,
} from "@/utils/sessionManager";

const publicRoutes = ["/","/components/aboutus", "/components/dentalpractices", "/components/dentalnurses", "/components/hygienist", "/components/accounting", "/components/contactus", "/locumStaff/login", "/locumStaff/register","/practiceUser/practiceRegister","/practiceUser/practiceLogin","/branch/login","/resetPassword","/forgetPassword","/components/termsandconditions","/user-guide","/user-guide/nurse","/user-guide/practice"];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isHandlingExpiry = useRef(false);

  useEffect(() => {
    if (publicRoutes.includes(router.pathname)) return;
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    if (hasSessionExpired()) {
      if (isHandlingExpiry.current) return;
      isHandlingExpiry.current = true;

      const handleExpiry = async () => {
        // Get user type from profile before clearing session storage
        let loginRoute = "/";
        const profileStr = window.localStorage.getItem("profile");
        
        if (profileStr) {
          try {
            const profile = JSON.parse(profileStr);
            
            // Determine login route based on profile structure
            if (profile.userType === "branch") {
              loginRoute = "/branch/login";
            } else if (profile.emailAddress) {
              // Locum profiles have emailAddress field
              loginRoute = "/locumStaff/login";
            } else if (profile.email) {
              // Practice profiles have email field (not emailAddress)
              loginRoute = "/practiceUser/practiceLogin";
            }
          } catch (error) {
            console.error("Error parsing profile:", error);
          }
        }

        clearSessionStorage();
        await Swal.fire({
          title: "Session Closed",
          text: "Your session has expired after 24 hours. Please sign in again to continue.",
          icon: "info",
          confirmButtonText: "OK",
          confirmButtonColor: "#C3EAE7",
        });
        router.replace(loginRoute);
        isHandlingExpiry.current = false;
      };

      void handleExpiry();
    }
  }, [router, router.pathname]);

  return <>{children}</>;
}
