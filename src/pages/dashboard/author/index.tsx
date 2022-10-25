import { useRouter } from "next/router";
import { NextPage } from "next/types";
import React, { useEffect } from "react";
import { DashboardAuthorLayout } from "../../../components/layout/dashboard/DashboardAuthorLayout";

const DashboardAuthorPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/author/submissions");
    })();
  }, [router]);

  return <DashboardAuthorLayout />;
};

export default DashboardAuthorPage;
