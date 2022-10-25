import React from "react";

type SelectOptionsProps = {
  selectedValue?: string;
  selectData: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
};

export const SelectOptions = ({
  selectData,
  selectedValue,
}: SelectOptionsProps) => {
  return (
    <>
      {selectData.map((data) => (
        <option
          key={data.value}
          disabled={data.disabled}
          selected={data.value === selectedValue}
          value={data.value}
        >
          {data.label}
        </option>
      ))}
    </>
  );
};
