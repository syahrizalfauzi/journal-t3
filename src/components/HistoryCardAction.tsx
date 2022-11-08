import React from "react";
import LayoutProps from "../types/LayoutProps";

type Props = LayoutProps & {
  isLoading: boolean;
  withSubmit?: boolean;
  outside?: React.ReactNode;
};

export const HistoryCardAction = ({
  withSubmit = true,
  isLoading,
  outside,
  children,
}: Props) => {
  return (
    <>
      <div className="divider divider-vertical m-0" />
      <div className="flex flex-row items-start justify-between self-stretch">
        <div className="w-full flex-1">
          {children}
          {outside && <div className="mx-4">{outside}</div>}
        </div>
        {withSubmit && (
          <div className="mt-3">
            <input
              disabled={isLoading}
              type="submit"
              value={isLoading ? "Submitting" : "Submit"}
              className="btn btn-info btn-sm text-white"
            />
          </div>
        )}
      </div>
    </>
  );
};
