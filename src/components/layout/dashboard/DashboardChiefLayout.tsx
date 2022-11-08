import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import { ActiveLink } from "../../ActiveLink";
import { AuthGuard } from "../../AuthGuard";
import { DashboardLayout } from "../DashboardLayout";

export const DashboardChiefLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="chief">
        <div className="flex flex-col items-stretch gap-4">
          <p className="text-4xl font-bold">Chief Dashboard</p>
          <div className="tabs tabs-boxed self-start">
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/chief/submissions"
            >
              <a>Submissions</a>
            </ActiveLink>
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/chief/editions"
            >
              <a>Journal Editions</a>
            </ActiveLink>
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/chief/settings"
            >
              <a>Submission Settings</a>
            </ActiveLink>
          </div>
          {children}
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};
