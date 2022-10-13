import { signOut, useSession } from "next-auth/react";
import React from "react";
import LayoutProps from "../../types/LayoutProps";
import { roleMap } from "../../utils/role";
import ActiveLink from "../ActiveLink";
import AuthGuard from "../AuthGuard";
import RootLayout from "./RootLayout";

const DashboardLayout = ({ children }: LayoutProps) => {
  const handleLogOut = () => signOut({ callbackUrl: "/auth/login" });
  const { data } = useSession();

  const role = roleMap[data?.user.role ?? 0];

  return (
    <AuthGuard allowedRole="loggedIn">
      <RootLayout>
        <main className="container my-8 flex flex-1 flex-row items-stretch">
          <nav className="mr-4 min-w-[12rem] border-r border-gray-400 pr-4">
            {(data?.user.role ?? 0) > 0 && (
              <>
                <div className="text-lg font-bold">Role</div>
                <div className="divider divider-vertical m-0" />
                <ul className="menu menu-vertical gap-1">
                  {role?.isAuthor && (
                    <li className="pointer-events-auto">
                      <ActiveLink
                        activeClassName="font-bold bg-gray-200"
                        className="btn-ghost rounded-lg"
                        pathName="/dashboard/author"
                      >
                        <a>Author</a>
                      </ActiveLink>
                    </li>
                  )}
                  {role?.isReviewer && (
                    <li className="pointer-events-auto">
                      <ActiveLink
                        activeClassName="font-bold bg-gray-200"
                        className="btn-ghost rounded-lg"
                        pathName="/dashboard/reviewer"
                      >
                        <a>Reviewer</a>
                      </ActiveLink>
                    </li>
                  )}
                  {role?.isChief && (
                    <li className="pointer-events-auto">
                      <ActiveLink
                        activeClassName="font-bold bg-gray-200"
                        className="btn-ghost rounded-lg"
                        pathName="/dashboard/chief"
                      >
                        <a>Chief Editor</a>
                      </ActiveLink>
                    </li>
                  )}
                  {role?.isAdmin && (
                    <li className="pointer-events-auto">
                      <ActiveLink
                        activeClassName="font-bold bg-gray-200"
                        className="btn-ghost rounded-lg"
                        pathName="/dashboard/admin"
                      >
                        <a>Admin</a>
                      </ActiveLink>
                    </li>
                  )}
                </ul>
              </>
            )}
            <div className="mt-4 text-lg font-bold">Account</div>
            <div className="divider divider-vertical m-0" />
            <ul className="menu menu-vertical gap-1">
              <li className="pointer-events-auto">
                <ActiveLink
                  activeClassName="font-bold bg-gray-200"
                  className="btn-ghost rounded-lg"
                  pathName="/dashboard/settings"
                >
                  <a>Settings</a>
                </ActiveLink>
              </li>
              <li className="pointer-events-auto">
                <div
                  onClick={handleLogOut}
                  className="btn-ghost rounded-lg text-error"
                >
                  Log Out
                </div>
              </li>
            </ul>
          </nav>
          <div className="flex-1 overflow-x-auto pb-12">{children}</div>
        </main>
      </RootLayout>
    </AuthGuard>
  );
};

export default DashboardLayout;
