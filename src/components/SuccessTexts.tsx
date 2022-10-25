import React from "react";

type SuccessTextsProps = {
  message?: string;
};

export const SuccessTexts = ({ message }: SuccessTextsProps) => {
  if (message)
    return (
      <div className="alert alert-success flex-col items-start gap-1 text-white">
        <p className="whitespace-pre-line">{message}</p>
      </div>
    );

  return null;
};
