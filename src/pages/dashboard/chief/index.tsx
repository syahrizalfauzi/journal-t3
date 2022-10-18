import { useRouter } from "next/router";
import { NextPage } from "next/types";
import React, { useEffect } from "react";
import DashboardChiefLayout from "../../../components/layout/dashboard/DashboardAuthorLayout";

const DashboardChiefPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/chief/submissions");
    })();
  }, [router]);

  return <DashboardChiefLayout />;
};

export default DashboardChiefPage;
