import { toast } from "react-toastify";
import { TRPCClientErrorLike } from "@trpc/client";

export const toastSettleHandler = (
  data: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: TRPCClientErrorLike<any> | null
) => {
  if (data) {
    toast(data, {
      type: "success",
      position: "bottom-right",
      autoClose: 3000,
    });
    return;
  }
  if (error) {
    toast(error.message, {
      type: "error",
      position: "bottom-right",
      autoClose: false,
    });
  }
};

export const showErrorToast = (message: string) => {
  toast(message, {
    type: "error",
    position: "bottom-right",
    autoClose: false,
  });
};

export const showSuccessToast = (message: string) => {
  toast(message, {
    type: "success",
    position: "bottom-right",
    autoClose: 3000,
  });
};
