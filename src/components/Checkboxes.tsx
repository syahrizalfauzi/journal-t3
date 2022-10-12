import React from "react";
import LayoutProps from "../types/client/LayoutProps";

type CheckboxesProps = LayoutProps & {
  checkboxData: {
    id: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
    rest?: any;
  }[];
  disabled?: boolean;
};

const Checkboxes = ({ checkboxData, children, disabled }: CheckboxesProps) => {
  return (
    <div className="form-control">
      {children}
      {checkboxData.map((data) => (
        <label
          key={data.id}
          htmlFor={data.id}
          className="label cursor-pointer justify-start gap-4"
        >
          <input
            name={data.id}
            {...data.rest}
            disabled={disabled || data.disabled}
            id={data.id}
            checked={data.checked}
            type="checkbox"
            className="checkbox"
          />
          <span className="label-text">{data.label}</span>
        </label>
      ))}
    </div>
  );
};

export default Checkboxes;
