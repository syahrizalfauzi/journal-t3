import React from "react";
import LayoutProps from "../types/LayoutProps";

type InputLabelProps = LayoutProps & {
  label: string;
};

const InputLabel = ({ children, label }: InputLabelProps) => {
  return (
    <label className="input-group">
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </label>
  );
};

export default InputLabel;
