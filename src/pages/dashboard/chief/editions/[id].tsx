import React, { useEffect } from "react";
import type { NextPage } from "next/types";
import { DashboardChiefLayout } from "../../../../components/layout/dashboard/DashboardChiefLayout";
import { InputLabel } from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import { useRouter } from "next/router";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { ensureRouterQuery } from "../../../../components/hoc/ensureRouterQuery";
import { updateEditionValidator } from "../../../../server/validators/edition";
import { parseDateDay } from "../../../../utils/parseDate";
import { KeywordBadges } from "../../../../components/KeywordBadges";
import { Checkboxes } from "../../../../components/Checkboxes";

type EditEditionForm = z.infer<typeof updateEditionValidator>;

const DashboardChiefEditionsEditPage: NextPage = () => {
  const { query } = useRouter();

  const {
    data: edition,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.edition.get.useQuery(query.id as string);

  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.edition.update.useMutation({
      onSettled: toastSettleHandler,
    });

  const { register, handleSubmit, reset } = useForm<EditEditionForm>();

  const onSubmit: SubmitHandler<EditEditionForm> = (data) => {
    mutationUpdate(data);
  };

  useEffect(() => {
    if (!edition) return;

    reset(edition);
  }, [edition, reset]);

  return (
    <DashboardChiefLayout>
      <DetailLayout
        isLoading={queryLoading}
        data={edition}
        errorMessage={queryError?.message}
        render={(data) => (
          <>
            <p className="text-xl font-medium">Edit Edition</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <InputLabel label="Edition Name">
                <input
                  {...register("name")}
                  disabled={mutationLoading}
                  required
                  type="text"
                  placeholder="2022, Vol. 1"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="DOI (Digital Object Identifier)">
                <input
                  {...register("doi")}
                  disabled={mutationLoading}
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
                disabled={mutationLoading}
                type="submit"
                value="Update Edition"
                className="btn"
              />
            </form>
            {data.manuscripts.length > 0 && (
              <p className="text-xl font-medium">Articles</p>
            )}
            {data.manuscripts.map(
              ({ authors, id, keywords, latestHistory, title }) => {
                if (!latestHistory || !latestHistory.history.submission)
                  return null;
                return (
                  <a
                    key={id}
                    className="pointer pointer flex flex-col gap-1 rounded-xl border bg-white p-4 shadow-xl duration-100 hover:bg-gray-100"
                    href={latestHistory?.history.submission?.fileUrl}
                  >
                    <p className="text-lg font-medium">{title}</p>
                    <p className="italic">{authors}</p>
                    <KeywordBadges keywords={keywords} />
                    {!!latestHistory && (
                      <p className="text-gray-400">
                        Available{" "}
                        {parseDateDay(latestHistory?.history.updatedAt)}
                      </p>
                    )}
                  </a>
                );
              }
            )}
          </>
        )}
      />
    </DashboardChiefLayout>
  );
};

export default ensureRouterQuery("id", DashboardChiefEditionsEditPage);
