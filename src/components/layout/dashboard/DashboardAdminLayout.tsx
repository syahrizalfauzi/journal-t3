import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import { ActiveLink } from "../../ActiveLink";
import { AuthGuard } from "../../AuthGuard";
import { DashboardLayout } from "../DashboardLayout";

export const DashboardAdminLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="admin">
        <div className="flex flex-col items-stretch gap-4">
          <p className="text-4xl font-bold">Admin Dashboard</p>
          <div className="tabs tabs-boxed self-start">
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/admin/users"
            >
              <a>Users</a>
            </ActiveLink>
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/admin/questions"
            >
              <a>Review Questions</a>
            </ActiveLink>
          </div>
          {children}
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};
