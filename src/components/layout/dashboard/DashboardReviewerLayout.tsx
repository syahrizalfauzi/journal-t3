import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import { ActiveLink } from "../../ActiveLink";
import { AuthGuard } from "../../AuthGuard";
import { DashboardLayout } from "../DashboardLayout";

export const DashboardReviewerLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="reviewer">
        <div className="flex flex-col items-stretch gap-4">
          <p className="text-4xl font-bold">Reviewer Dashboard</p>
          <div className="tabs tabs-boxed self-start">
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/reviewer/assignments"
            >
              <a>Assignments</a>
            </ActiveLink>
            <ActiveLink
              activeClassName="font-bold tab-active"
              className="tab tab-md"
              pathName="/dashboard/reviewer/invitations"
            >
              <a>Invitations</a>
            </ActiveLink>
          </div>
          {children}
        </div>
      </AuthGuard>
    </DashboardLayout>
  );
};
