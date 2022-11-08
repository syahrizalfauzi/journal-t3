import React from "react";
import LayoutProps from "../types/LayoutProps";

type Props = LayoutProps & {
  label: string;
};

export const InputLabel = ({ children, label }: Props) => {
  return (
    <label className="input-group">
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </label>
  );
};
