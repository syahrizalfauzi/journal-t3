import React from "react";
import type { NextPage } from "next/types";
import DashboardAdminLayout from "../../../../components/layout/dashboard/DashboardAdminLayout";
import InputLabel from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { questionValidators } from "../../../../server/validators/question";

type CreateQuestionForm = z.infer<typeof questionValidators>;

const DashboardAdminQuestionCreatePage: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<CreateQuestionForm>();
  const { mutate, isLoading } = trpc.question.create.useMutation({
    onSettled: toastSettleHandler(true),
  });

  const onSubmit: SubmitHandler<CreateQuestionForm> = ({
    question,
    maxScale,
  }) => {
    mutate(
      { question, maxScale: Number(maxScale) },
      { onSuccess: () => reset() }
    );
  };

  return (
    <DashboardAdminLayout>
      <p className="text-xl font-medium">Create Review Question</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputLabel label="Question">
          <input
            {...register("question")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Question"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Max Scale">
          <input
            {...register("maxScale")}
            disabled={isLoading}
            required
            type="number"
            placeholder="Maximum Scale (number)"
            className="input input-bordered w-full"
          />
        </InputLabel>

        <input
          disabled={isLoading}
          type="submit"
          value="Create Review Question"
          className="btn"
        />
      </form>
    </DashboardAdminLayout>
  );
};

export default DashboardAdminQuestionCreatePage;
