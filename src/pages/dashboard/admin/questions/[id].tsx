import React, { useEffect } from "react";
import type { NextPage } from "next/types";
import { DashboardAdminLayout } from "../../../../components/layout/dashboard/DashboardAdminLayout";
import { InputLabel } from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import { useRouter } from "next/router";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { updateQuestionValidator } from "../../../../server/validators/question";

type EditQuestionForm = z.infer<typeof updateQuestionValidator>;

const DashboardAdminQuestionEditPage: NextPage = () => {
  const { query } = useRouter();

  const {
    data: question,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.question.get.useQuery(query.id as string);

  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.question.update.useMutation({
      onSettled: toastSettleHandler,
    });

  const { register, handleSubmit, reset } = useForm<EditQuestionForm>();

  const onSubmit: SubmitHandler<EditQuestionForm> = (data) => {
    mutationUpdate({
      ...data,
      maxScale: Number(data.maxScale),
    });
  };

  useEffect(() => {
    if (!question) return;

    reset(question);
  }, [question, reset]);

  return (
    <DashboardAdminLayout>
      <DetailLayout
        isLoading={queryLoading}
        data={question}
        errorMessage={queryError?.message}
        render={() => (
          <>
            <p className="text-xl font-medium">Edit Review Question</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <InputLabel label="Question">
                <input
                  {...register("question")}
                  disabled={mutationLoading}
                  required
                  type="text"
                  placeholder="Question"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Max Scale">
                <input
                  {...register("maxScale")}
                  disabled={mutationLoading}
                  required
                  type="number"
                  placeholder="Maximum Scale (number)"
                  className="input input-bordered w-full"
                />
              </InputLabel>

              <input
                disabled={mutationLoading}
                type="submit"
                value="Create Review Question"
                className="btn"
              />
            </form>
          </>
        )}
      />
    </DashboardAdminLayout>
  );
};

export default DashboardAdminQuestionEditPage;
