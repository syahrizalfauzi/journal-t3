import { GetServerSideProps } from "next";
import React from "react";
import { prisma } from "../server/db/client";

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  });

  if (!settings?.maintenanceMode) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const MaintenancePage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Maintenance</h1>
      <p className="text-xl">
        We are currently performing maintenance. Please check back later.
      </p>
    </div>
  );
};

export default MaintenancePage;
