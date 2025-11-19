import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  clearSessionStorage,
  hasSessionExpired,
} from "@/utils/sessionManager";

const publicRoutes = ["/","/components/aboutus", "/components/dentalpractices", "/components/dentalnurses", "/components/hygienist", "/components/accounting", "/components/contactus", "/locumStaff/login", "/locumStaff/register","/practiceUser/practiceRegister","/practiceUser/practiceLogin","/branch/login","/resetPassword"];

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
        clearSessionStorage();
        await Swal.fire({
          title: "Session Closed",
          text: "Your session has expired after 24 hours. Please sign in again to continue.",
          icon: "info",
          confirmButtonText: "OK",
          confirmButtonColor: "#C3EAE7",
        });
        router.replace("/");
        isHandlingExpiry.current = false;
      };

      void handleExpiry();
    }
  }, [router, router.pathname]);

  return <>{children}</>;
}
