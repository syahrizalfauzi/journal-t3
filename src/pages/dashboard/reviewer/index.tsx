import { useRouter } from "next/router";
import { NextPage } from "next/types";
import React, { useEffect } from "react";
import { DashboardReviewerLayout } from "../../../components/layout/dashboard/DashboardReviewerLayout";

const DashboardReviewerPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/reviewer/assignments");
    })();
  }, [router]);

  return <DashboardReviewerLayout />;
};

export default DashboardReviewerPage;
