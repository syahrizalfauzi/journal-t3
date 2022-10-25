import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import { AuthGuard } from "../../AuthGuard";
import { DashboardLayout } from "../DashboardLayout";

export const DashboardChiefLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="chief">
        <div className="flex flex-col items-stretch gap-4">
          <p className="text-4xl font-bold">Chief Dashboard</p>
          {children}
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};
