import React from "react";

type ErrorTextsProps = {
  message?: string | string[];
};

const ErrorTexts = ({ message }: ErrorTextsProps) => {
  if (message)
    return (
      <div className="alert alert-error flex-col items-start gap-1 text-white">
        <p className="whitespace-pre-line">{message}</p>
      </div>
    );

  return null;
};

export default ErrorTexts;
