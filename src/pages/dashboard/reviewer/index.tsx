import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { DashboardReviewerLayout } from "../../../components/layout/dashboard/DashboardReviewerLayout";

const DashboardReviewerPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await router.push("/dashboard/reviewer/assignments");
    })();
  }, [router]);

  return <DashboardReviewerLayout />;
};

export default DashboardReviewerPage;
