import React from "react";
import LayoutProps from "../../../types/LayoutProps";
import ErrorTexts from "../../ErrorTexts";

type DetailLayoutProps = LayoutProps & {
  isLoading: boolean;
  hasData: boolean;
  errorMessage?: string;
};

const DetailLayout = ({
  isLoading,
  errorMessage,
  hasData,
  children,
}: DetailLayoutProps) => {
  return (
    <>
      {isLoading && <p>Loading...</p>}
      {errorMessage && <ErrorTexts>{errorMessage}</ErrorTexts>}
      {!isLoading && !errorMessage && hasData && children}
    </>
  );
};

export default DetailLayout;
