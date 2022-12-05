import React, { useState } from "react";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
import { DashboardAuthorLayout } from "../../../../components/layout/dashboard/DashboardAuthorLayout";
import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import { ManuscriptSteps } from "../../../../components/ManuscriptSteps";
import { ManuscriptDetailCardAuthor } from "../../../../components/ManuscriptDetailCardAuthor";
import { HistoryCardAuthor } from "../../../../components/HistoryCardAuthor";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { ensureRouterQuery } from "../../../../components/hoc/ensureRouterQuery";
import { NextPage } from "next/types";
import { uploadFile } from "../../../../utils/firebaseStorage";
import { FOLDER_NAMES } from "../../../../constants/others";

const DashboardAuthorSubmissionsDetailPage: NextPage = () => {
  const { query } = useRouter();

  const {
    data: manuscript,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = trpc.manuscript.getForAuthor.useQuery(query.id as string);
  const [isUploading, setIsUploading] = useState(false);

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
    finalize.isLoading ||
    isUploading;

  const handleUpdateOptionalFile = async (optionalFile: File) => {
    setIsUploading(true);
    const optionalFileUrl = await uploadFile(
      optionalFile,
      FOLDER_NAMES.optionalFiles
    );
    setIsUploading(false);
    updateOptionalFile.mutate(
      { id: query.id as string, optionalFileUrl },
      { onSuccess: () => refetch() }
    );
  };

  const handleRevise = async (file: File) => {
    setIsUploading(true);
    const fileUrl = await uploadFile(file, FOLDER_NAMES.manuscripts);
    setIsUploading(false);
    revise.mutate(
      {
        manuscriptId: query.id as string,
        fileUrl,
      },
      { onSuccess: () => refetch() }
    );
  };

  const handleFinalize = async (file: File | undefined | null) => {
    let fileUrl: string | undefined = undefined;
    if (file) {
      setIsUploading(true);
      fileUrl = await uploadFile(file, FOLDER_NAMES.manuscripts);
      setIsUploading(false);
    }
    finalize.mutate(
      {
        manuscriptId: query.id as string,
        fileUrl,
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
