import React from "react";
import LayoutProps from "../types/client/LayoutProps";

const ErrorTexts = ({ children }: LayoutProps) => {
  return (
    <div className="alert alert-error flex-col items-start gap-1 text-white">
      <p className="whitespace-pre-line">{children}</p>
    </div>
  );
};

export default ErrorTexts;
