import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import AuthGuard from "../../AuthGuard";
import DashboardLayout from "../DashboardLayout";

const DashboardAuthorLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="author">
        <div className="flex flex-col items-stretch gap-4">
          <p className="text-4xl font-bold">Author Dashboard</p>
          {children}
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};

export default DashboardAuthorLayout;
