import React from "react";
import LayoutProps from "../../types/LayoutProps";
import { Navbar } from "../Navbar";

export const RootLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="hidden bg-gray-200 " />
      <div className="hidden bg-error" />
      <div className="hidden bg-info" />
      <div className="hidden bg-warning" />
      <div className="hidden bg-success" />
      <div className="hidden bg-accent" />
      <div className="hidden bg-secondary" />
      <div className="hidden bg-primary" />
      <div className="hidden border-gray-200 " />
      <div className="hidden border-error" />
      <div className="hidden border-info" />
      <div className="hidden border-warning" />
      <div className="hidden border-success" />
      <div className="hidden border-accent" />
      <div className="hidden border-secondary" />
      <div className="hidden border-primary" />
      <div className="fixed z-50 w-full">
        <Navbar />
      </div>
      <div className="mt-[66px] h-full w-screen flex-1">{children}</div>
    </div>
  );
};
