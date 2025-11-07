import { useRouter } from "next/router";
import { useEffect } from "react";

const publicRoutes = ["/","/components/aboutus", "/components/dentalpractices", "/components/dentalnurses", "/components/hygienist", "/components/accounting", "/components/contactus", "/locumStaff/login", "/locumStaff/register","/practiceUser/practiceRegister","/practiceUser/practiceLogin","/branch/login"];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (publicRoutes.includes(router.pathname)) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/"); 
    }
  }, [router]);

  return <>{children}</>;
}
