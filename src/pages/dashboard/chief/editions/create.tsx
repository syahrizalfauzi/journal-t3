import React from "react";
import type { NextPage } from "next/types";
import { InputLabel } from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { editionValidator } from "../../../../server/validators/edition";
import { DashboardChiefLayout } from "../../../../components/layout/dashboard/DashboardChiefLayout";
import { Checkboxes } from "../../../../components/Checkboxes";

type CreateEditionForm = z.infer<typeof editionValidator>;

const DashboardChiefEditionCreatePage: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<CreateEditionForm>();
  const { mutate, isLoading } = trpc.edition.create.useMutation({
    onSettled: toastSettleHandler,
  });

  const onSubmit: SubmitHandler<CreateEditionForm> = (data) => {
    mutate(data, { onSuccess: () => reset() });
  };

  return (
    <DashboardChiefLayout>
      <p className="text-xl font-medium">Create Edition</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputLabel label="Edition Name">
          <input
            {...register("name")}
            disabled={isLoading}
            required
            type="text"
            placeholder="2022, Vol. 1"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="DOI (Digital Object Identifier)">
          <input
            {...register("doi")}
            disabled={isLoading}
            required
            type="text"
            placeholder="10.1234/5678"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <Checkboxes
          checkboxData={[
            {
              id: "isAvailable",
              label: "Available To Public",
              rest: register("isAvailable"),
            },
          ]}
        />
        <input
          disabled={isLoading}
          type="submit"
          value="Create Edition"
          className="btn"
        />
      </form>
    </DashboardChiefLayout>
  );
};

export default DashboardChiefEditionCreatePage;
