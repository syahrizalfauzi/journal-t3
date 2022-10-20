import React from "react";
import DetailLayout from "../../../../components/layout/dashboard/DetailLayout";
import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import ManuscriptSteps from "../../../../components/ManuscriptSteps";
import DashboardReviewerLayout from "../../../../components/layout/dashboard/DashboardReviewerLayout";
import ManuscriptDetailCardReviewer from "../../../../components/ManuscriptDetailCardReviewer";
import HistoryCardReviewer from "../../../../components/HistoryCardReviewer";

const DashboardReviewAssignmentsDetailPage = () => {
  const { query } = useRouter();

  if (!query.id) return null;

  const {
    data: manuscript,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.manuscript.getForReviewer.useQuery(query.id as string);

  return (
    <>
      {/* <ReactModal
        isOpen={!!review}
        onRequestClose={() => setReview(null)}
        contentLabel="Submit Assessment"
        className="container grid h-full items-center"
      >
        {!!review && <AssessmentModal review={review} />}
      </ReactModal> */}
      <DashboardReviewerLayout>
        <DetailLayout
          isLoading={queryLoading}
          errorMessage={queryError?.message}
          data={manuscript}
          render={(data) => (
            <div className="flex flex-col items-stretch gap-8">
              <ManuscriptSteps status={data.history[0]!.status} />
              <ManuscriptDetailCardReviewer manuscriptDetail={data} />
              {data.history.map((history, index) => (
                <HistoryCardReviewer
                  key={history.id}
                  history={history}
                  manuscript={data}
                  withAction={index <= 0}
                />
              ))}
            </div>
          )}
        />
      </DashboardReviewerLayout>
    </>
  );
};

export default DashboardReviewAssignmentsDetailPage;
