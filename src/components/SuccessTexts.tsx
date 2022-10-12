import React from "react";
import LayoutProps from "../types/LayoutProps";

const SuccessTexts = ({ children }: LayoutProps) => {
  return (
    <div className="alert alert-success flex-col items-start gap-1 text-white">
      <p className="whitespace-pre-line">{children}</p>
    </div>
  );
};

export default SuccessTexts;
