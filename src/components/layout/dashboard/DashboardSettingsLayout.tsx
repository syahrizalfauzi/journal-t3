import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import ActiveLink from "../../ActiveLink";
import DashboardLayout from "../DashboardLayout";

const DashboardSettingsLayout = ({ children }: LayoutProps) => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-stretch gap-4">
        <p className="text-4xl font-bold">Account Settings</p>
        <div className="tabs tabs-boxed self-start">
          <ActiveLink
            activeClassName="font-bold tab-active"
            className="tab tab-md"
            pathName="/dashboard/settings/user"
          >
            <a>User</a>
          </ActiveLink>
          <ActiveLink
            activeClassName="font-bold tab-active"
            className="tab tab-md"
            pathName="/dashboard/settings/password"
          >
            <a>Password</a>
          </ActiveLink>
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettingsLayout;
