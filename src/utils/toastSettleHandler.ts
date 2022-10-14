import { toast } from "react-toastify";
import { TRPCClientErrorLike } from "@trpc/client";

export const toastSettleHandler =
  (noAutoClose?: boolean) =>
  (data: string | undefined, error: TRPCClientErrorLike<any> | null) => {
    if (data) {
      toast(data, {
        type: "success",
        position: "bottom-right",
        autoClose: noAutoClose ? false : 3000,
      });
      return;
    }
    if (error) {
      toast(error.message, {
        type: "error",
        position: "bottom-right",
        autoClose: noAutoClose ? false : 3000,
      });
    }
  };
