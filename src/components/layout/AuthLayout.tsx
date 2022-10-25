import React from "react";
import LayoutProps from "../../types/LayoutProps";
import { AuthGuard } from "../AuthGuard";

export const AuthLayout = ({ children }: LayoutProps) => {
  return (
    <AuthGuard redirectTo="/" allowedRole="loggedOut">
      <main className="container flex-1">{children}</main>
    </AuthGuard>
  );
};
