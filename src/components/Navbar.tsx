import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import ActiveLink from "./ActiveLink";
import { BsPerson } from "react-icons/bs";

const Navbar = () => {
  const { data, status } = useSession();

  const handleLogOut = () => signOut({ callbackUrl: "/auth/login" });

  return (
    <nav className="navbar z-20 bg-white shadow-md">
      <div className="container">
        <div className="flex-1">
          <Link href="/">
            <a className="btn btn-ghost text-xl normal-case">LOGO</a>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal gap-1 p-0">
            <li className="z-20">
              <ActiveLink
                className="btn-ghost rounded-lg "
                activeClassName="font-bold bg-gray-200"
                pathName="/"
                isSegmented={false}
              >
                <a>Home</a>
              </ActiveLink>
            </li>
            <li className="z-20">
              <ActiveLink
                className="btn-ghost rounded-lg "
                activeClassName="font-bold bg-gray-200"
                pathName="/archive"
              >
                <a>Archive</a>
              </ActiveLink>
            </li>
            <li className="z-20">
              <ActiveLink
                className="btn-ghost rounded-lg "
                activeClassName="font-bold bg-gray-200"
                pathName="/announcements"
              >
                <a>Announcements</a>
              </ActiveLink>
            </li>
            {status === "unauthenticated" && (
              <li className="btn rounded-md p-0 text-base font-normal capitalize">
                <Link href="/auth/login">Log in</Link>
              </li>
            )}
            {status === "authenticated" && (
              <>
                <li className="z-20">
                  <ActiveLink
                    className="btn-ghost rounded-lg "
                    activeClassName="font-bold bg-gray-200"
                    pathName="/dashboard"
                  >
                    <a>Dashboard</a>
                  </ActiveLink>
                </li>
                <div className="dropdown-end dropdown">
                  <label
                    tabIndex={0}
                    className="avatar btn btn-ghost gap-4 normal-case"
                  >
                    <p>{data.user.username}</p>
                    <BsPerson size="24px" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu rounded-box menu-compact mt-3 bg-base-100 p-2 shadow"
                  >
                    <li className="z-20">
                      <a href="/dashboard/settings/user">Settings</a>
                    </li>
                    <li className="z-20">
                      <div onClick={handleLogOut} className="text-error">
                        Logout
                      </div>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
