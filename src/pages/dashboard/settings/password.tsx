import React from "react";
import { z } from "zod";
import { changePasswordValidator } from "../../../server/validators/user";
import { trpc } from "../../../utils/trpc";
import { toastSettleHandler } from "../../../utils/toastSettleHandler";
import { SubmitHandler, useForm } from "react-hook-form";
import { DashboardSettingsLayout } from "../../../components/layout/dashboard/DashboardSettingsLayout";
import { InputLabel } from "../../../components/InputLabel";
import { NextPage } from "next/types";

type ChangePasswordForm = z.infer<typeof changePasswordValidator>;

const DashboardSettingsPasswordPage: NextPage = () => {
  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.auth.changePassword.useMutation({
      onSettled: toastSettleHandler,
    });

  const { register, handleSubmit } = useForm<ChangePasswordForm>();

  const onSubmit: SubmitHandler<ChangePasswordForm> = (data) => {
    mutationUpdate(data, {
      onSettled: (...params) => console.log("GABISA GAN", { ...params }),
    });
  };

  return (
    <DashboardSettingsLayout>
      <div className="flex flex-col items-stretch gap-4">
        <p className="text-xl font-medium">Change Password</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputLabel label="Current Password">
            <input
              {...register("oldPassword")}
              disabled={mutationLoading}
              required
              type="password"
              placeholder="Current Password"
              className="input input-bordered w-full"
            />
          </InputLabel>
          <InputLabel label="New Password">
            <input
              {...register("newPassword")}
              disabled={mutationLoading}
              required
              type="password"
              placeholder="Current Password"
              className="input input-bordered w-full"
            />
          </InputLabel>
          <input
            disabled={mutationLoading}
            type="submit"
            value="Update Password"
            className="btn"
          />
        </form>
      </div>
    </DashboardSettingsLayout>
  );
};

export default DashboardSettingsPasswordPage;
