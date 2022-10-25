import { useRouter } from "next/router";
import { NextPage } from "next/types";
import React, { useEffect } from "react";
import { DashboardAdminLayout } from "../../../components/layout/dashboard/DashboardAdminLayout";

const DashboardAdminPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/admin/users");
    })();
  }, [router]);

  return <DashboardAdminLayout />;
};

export default DashboardAdminPage;
