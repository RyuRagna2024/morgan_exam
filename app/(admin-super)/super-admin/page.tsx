"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SuperAdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/super-admin/routing-hub");
  }, [router]);

  // Return minimal content or loading indicator that will only briefly appear
  return <div>Redirecting...</div>;
};

export default SuperAdminPage;
