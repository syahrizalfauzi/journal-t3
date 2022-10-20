import React from "react";
import LayoutProps from "../../types/LayoutProps";

const AssessmentLayout = ({ children }: LayoutProps) => {
  return (
    <div className="container my-4 overflow-x-hidden px-8">{children}</div>
  );
};

export default AssessmentLayout;
