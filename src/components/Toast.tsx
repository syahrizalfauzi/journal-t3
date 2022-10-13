import React, { useEffect, useState } from "react";
import LayoutProps from "../types/LayoutProps";

type ToastProps = LayoutProps & {
  variant: "success" | "error";
};

function Toast({ variant = "success", children }: ToastProps) {
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsShown(false), 3000);
  }, []);

  if (isShown)
    return (
      <div
        className="toast z-50 cursor-pointer"
        onClick={() => setIsShown(false)}
      >
        <div className={`alert alert-${variant} flex-col text-white`}>
          {children}
        </div>
      </div>
    );

  return null;
}

export default Toast;
