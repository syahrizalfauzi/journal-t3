import React from "react";
import LayoutProps from "../types/LayoutProps";

type Props = LayoutProps & {
  label?: string;
};

export const FileInput = ({ children, label }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">{label}</p>
      {children}
    </div>
  );
};
