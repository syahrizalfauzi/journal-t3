import React from "react";

type Props = {
  message?: string | string[];
};

export const ErrorTexts = ({ message }: Props) => {
  if (message)
    return (
      <div className="alert alert-error flex-col items-start gap-1 text-white">
        <p className="whitespace-pre-line">{message}</p>
      </div>
    );

  return null;
};
