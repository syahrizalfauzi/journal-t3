import React from "react";
import { ErrorTexts } from "../../ErrorTexts";

type DetailLayoutProps<T> = {
  isLoading: boolean;
  data: T | undefined;
  errorMessage?: string;
  render: (data: T) => React.ReactNode;
};

export const DetailLayout = <T,>({
  isLoading,
  errorMessage,
  data,
  render,
}: DetailLayoutProps<T>) => {
  return (
    <>
      {isLoading && <p>Loading...</p>}
      <ErrorTexts message={errorMessage} />
      {!isLoading && !errorMessage && data && render(data)}
    </>
  );
};
