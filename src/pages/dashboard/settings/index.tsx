import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { DashboardSettingsLayout } from "../../../components/layout/dashboard/DashboardSettingsLayout";
import { NextPage } from "next/types";

const DashboardSettingsPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/settings/user");
    })();
  }, [router]);

  return <DashboardSettingsLayout />;
};

export default DashboardSettingsPage;
