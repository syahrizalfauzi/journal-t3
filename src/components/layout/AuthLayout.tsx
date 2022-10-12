import React from "react";
import LayoutProps from "../../types/client/LayoutProps";
import AuthGuard from "../AuthGuard";

const AuthLayout = ({ children }: LayoutProps) => {
  return (
    <AuthGuard redirectTo="/" allowedRole="loggedOut">
      <main className="container flex-1">{children}</main>
    </AuthGuard>
  );
};

export default AuthLayout;
