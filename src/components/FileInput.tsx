import React from "react";
import LayoutProps from "../types/LayoutProps";

type FileInput = LayoutProps & {
  label?: string;
};

const FileInput = ({ children, label }: FileInput) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">{label}</p>
      {children}
    </div>
  );
};

export default FileInput;
