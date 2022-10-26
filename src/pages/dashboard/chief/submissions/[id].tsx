import React from "react";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import { ManuscriptSteps } from "../../../../components/ManuscriptSteps";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { SAMPLE_FILE_URL } from "../../../../constants/others";
import { DashboardChiefLayout } from "../../../../components/layout/dashboard/DashboardChiefLayout";
import { ManuscriptDetailCardChief } from "../../../../components/ManuscriptDetailCardChief";
import { HistoryCardChief } from "../../../../components/HistoryCardChief";
import { REVIEW_DECISION } from "../../../../constants/numbers";

const DashboardChiefSubmissionsDetailPage = () => {
  const { query } = useRouter();

  const {
    data: manuscript,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = trpc.manuscript.getForChief.useQuery(query.id as string);

  const reject = trpc.history.reject.useMutation({
    onSettled: toastSettleHandler,
  });
  const accept = trpc.history.accept.useMutation({
    onSettled: toastSettleHandler,
  });
  const updateDueDate = trpc.review.updateDueDate.useMutation({
    onSettled: toastSettleHandler,
  });
  const updateDecision = trpc.review.updateDecision.useMutation({
    onSettled: toastSettleHandler,
  });
  const proofread = trpc.history.proofread.useMutation({
    onSettled: toastSettleHandler,
  });

  const isLoading =
    queryLoading ||
    reject.isLoading ||
    accept.isLoading ||
    updateDueDate.isLoading ||
    updateDecision.isLoading;

  const handleReject = (reason: string) => {
    reject.mutate(
      {
        manuscriptId: query.id as string,
        reason,
      },
      { onSuccess: () => refetch() }
    );
  };
  const handleAccept = (file: File, isBlind: boolean) => {
    console.log("TODO : onAccept file upload", file);
    accept.mutate(
      {
        manuscriptId: query.id as string,
        fileUrl: SAMPLE_FILE_URL,
        isBlind,
      },
      { onSuccess: () => refetch() }
    );
  };
  const handleupdateDueDate = (id: string, dueDate: Date) => {
    updateDueDate.mutate(
      {
        id,
        dueDate,
      },
      { onSuccess: () => refetch() }
    );
  };
  const handleReviewReject = (id: string, comment: string) => {
    updateDecision.mutate(
      {
        id,
        comment,
        decision: REVIEW_DECISION.rejected,
      },
      { onSuccess: () => refetch() }
    );
  };
  const handleReviewRevise = (id: string, comment: string) => {
    updateDecision.mutate(
      {
        id,
        comment,
        decision: REVIEW_DECISION.revision,
      },
      { onSuccess: () => refetch() }
    );
  };
  const handleReviewAccept = (id: string, proofreadFile: File) => {
    console.log("TODO : onReviewAccept file upload", proofreadFile);
    updateDecision.mutate(
      {
        id,
        decision: REVIEW_DECISION.accepted,
      },
      {
        onSuccess: () => {
          proofread.mutate(
            {
              fileUrl: SAMPLE_FILE_URL,
              manuscriptId: query.id as string,
            },
            { onSuccess: () => refetch() }
          );
        },
      }
    );
  };

  return (
    <DashboardChiefLayout>
      <DetailLayout
        isLoading={queryLoading}
        errorMessage={queryError?.message}
        data={manuscript}
        render={(data) => (
          <div className="flex flex-col items-stretch gap-8">
            <ManuscriptSteps status={data.history[0]!.status} />
            <ManuscriptDetailCardChief manuscriptDetail={data} />
            {data.history.map((history, index) => (
              <HistoryCardChief
                key={history.id}
                history={history}
                isLoading={isLoading}
                manuscript={data}
                withAction={index <= 0}
                onReject={handleReject}
                onAccept={handleAccept}
                onUpdateDueDate={handleupdateDueDate}
                onReviewReject={handleReviewReject}
                onReviewRevise={handleReviewRevise}
                onReviewAccept={handleReviewAccept}
              />
            ))}
          </div>
        )}
      />
    </DashboardChiefLayout>
  );
};

export default DashboardChiefSubmissionsDetailPage;
