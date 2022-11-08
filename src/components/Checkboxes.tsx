import React from "react";
import LayoutProps from "../types/LayoutProps";

type Props = LayoutProps & {
  checkboxData: {
    id: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
    rest?: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >;
  }[];
  disabled?: boolean;
};

export const Checkboxes = ({ checkboxData, children, disabled }: Props) => {
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
