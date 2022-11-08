import React from "react";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
import { DashboardAuthorLayout } from "../../../../components/layout/dashboard/DashboardAuthorLayout";
import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import { ManuscriptSteps } from "../../../../components/ManuscriptSteps";
import { ManuscriptDetailCardAuthor } from "../../../../components/ManuscriptDetailCardAuthor";
import { HistoryCardAuthor } from "../../../../components/HistoryCardAuthor";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { SAMPLE_FILE_URL } from "../../../../constants/others";
import { ensureRouterQuery } from "../../../../components/hoc/ensureRouterQuery";
import { NextPage } from "next/types";

const DashboardAuthorSubmissionsDetailPage: NextPage = () => {
  const { query } = useRouter();

  const {
    data: manuscript,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = trpc.manuscript.getForAuthor.useQuery(query.id as string);

  const updateOptionalFile = trpc.manuscript.updateOptionalFile.useMutation({
    onSettled: toastSettleHandler,
  });
  const revise = trpc.history.revise.useMutation({
    onSettled: toastSettleHandler,
  });
  const finalize = trpc.history.finalize.useMutation({
    onSettled: toastSettleHandler,
  });

  const isLoading =
    queryLoading ||
    updateOptionalFile.isLoading ||
    revise.isLoading ||
    finalize.isLoading;

  const handleUpdateOptionalFile = (optionalFile: File) => {
    console.log("TODO : optional file upload", optionalFile);
    updateOptionalFile.mutate(
      { id: query.id as string, optionalFileUrl: SAMPLE_FILE_URL },
      { onSuccess: () => refetch() }
    );
  };

  const handleRevise = (file: File) => {
    console.log("TODO : revision file upload", file);
    revise.mutate(
      {
        manuscriptId: query.id as string,
        fileUrl: SAMPLE_FILE_URL,
      },
      { onSuccess: () => refetch() }
    );
  };

  const handleFinalize = (file: File | undefined | null) => {
    console.log("TODO : finalization file upload", file);
    finalize.mutate(
      {
        manuscriptId: query.id as string,
        fileUrl: file ? SAMPLE_FILE_URL : undefined,
      },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <DashboardAuthorLayout>
      <DetailLayout
        isLoading={queryLoading}
        errorMessage={queryError?.message}
        data={manuscript}
        render={(data) => (
          <div className="flex flex-col items-stretch gap-8">
            <ManuscriptSteps status={data.latestHistory!.history.status} />
            <ManuscriptDetailCardAuthor
              manuscriptDetail={data}
              onUpdateOptionalFile={handleUpdateOptionalFile}
              isLoading={isLoading}
            />
            <HistoryCardAuthor
              history={data.latestHistory!.history}
              isLoading={isLoading}
              onRevise={handleRevise}
              onFinalize={handleFinalize}
            />
          </div>
        )}
      />
    </DashboardAuthorLayout>
  );
};

export default ensureRouterQuery("id", DashboardAuthorSubmissionsDetailPage);
