import { useRouter } from "next/router";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { InputLabel } from "../../../../components/InputLabel";
import { DashboardAdminLayout } from "../../../../components/layout/dashboard/DashboardAdminLayout";
import { pageValidator } from "../../../../server/validators/page";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { trpc } from "../../../../utils/trpc";

type CreatePageForm = z.infer<typeof pageValidator>;

const DashboardAdminPagesCreatePage = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<CreatePageForm>();
  const { mutate, isLoading } = trpc.page.create.useMutation({
    onSettled: toastSettleHandler,
  });

  const onSubmit: SubmitHandler<CreatePageForm> = ({ name, url }) => {
    mutate(
      { name, url, data: JSON.stringify(null) },
      { onSuccess: () => router.push("/dashboard/admin/pages") }
    );
  };

  return (
    <DashboardAdminLayout>
      <p className="text-xl font-medium">Create Page</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputLabel label="Page Name">
          <input
            {...register("name")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Page Name"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Page URL">
          <input
            {...register("url")}
            disabled={isLoading}
            required
            type="text"
            placeholder="/about/guideline"
            className="input input-bordered w-full"
          />
        </InputLabel>

        <input
          disabled={isLoading}
          type="submit"
          value="Create Page"
          className="btn"
        />
      </form>
    </DashboardAdminLayout>
  );
};

export default DashboardAdminPagesCreatePage;
