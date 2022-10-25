import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { AuthGuard } from "../../../components/AuthGuard";
import { AssessmentLayout } from "../../../components/layout/AssessmentLayout";
import { DetailLayout } from "../../../components/layout/dashboard/DetailLayout";
import { parseDate } from "../../../utils/parseDate";
import { parseAssessmentDecision } from "../../../utils/parseDecision";
import { trpc } from "../../../utils/trpc";

const AssessmentReviewerPage = () => {
  const { query } = useRouter();

  if (!query.id) return null;

  const { data: currentUser } = useSession();

  const {
    data: assessment,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.assessment.getForReviewer.useQuery(query.id as string);

  return (
    <AssessmentLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="reviewer">
        <DetailLayout
          isLoading={queryLoading}
          data={assessment}
          errorMessage={queryError?.message}
          render={(data) => {
            const { className, label } = parseAssessmentDecision(data.decision);

            return (
              <div className="flex flex-col items-stretch gap-4 overflow-x-hidden">
                <div className="flex flex-row justify-between">
                  <p className="font-bold">
                    Assessed at: {parseDate(data.createdAt)}
                  </p>
                  <p className="font-bold">
                    Submitted by:
                    {data.reviewerNumber <= -1
                      ? currentUser?.user.profile.name
                      : `Reviewer ${data.reviewerNumber}`}
                  </p>
                </div>
                <div className="divider divider-vertical m-0 p-0" />
                {data.reviewAnswers.map((answer) => (
                  <>
                    <p>{answer.reviewQuestion.question}</p>
                    <input
                      disabled
                      type="range"
                      min="1"
                      max={answer.reviewQuestion.maxScale}
                      value={answer.answer}
                      className="range"
                      step="1"
                    />
                    <div className="flex w-full justify-between px-2 text-xs">
                      {[...Array(answer.reviewQuestion.maxScale)].map(
                        (_, scaleIndex) => (
                          <span key={scaleIndex}>{scaleIndex + 1}</span>
                        )
                      )}
                    </div>
                  </>
                ))}

                <p className="text-lg font-bold">Decision</p>
                <p className={className}>{label}</p>
                {!!data.fileUrl && (
                  <>
                    <p className="text-lg font-bold">
                      Assessment file (for author)
                    </p>
                    <a className="link" href={data.fileUrl}>
                      {data.fileUrl}
                    </a>
                  </>
                )}
                {!!data.chiefFileUrl && (
                  <>
                    <p className="text-lg font-bold">
                      Assessment file (for chief editor)
                    </p>
                    <a className="link" href={data.chiefFileUrl}>
                      {data.chiefFileUrl}
                    </a>
                  </>
                )}
                <p className="text-lg font-bold">Comment for author</p>
                <p>
                  {data.authorComment.length > 0 ? data.authorComment : "-"}
                </p>
                <p className="text-lg font-bold">Comment for chief editor</p>
                <p>
                  {data.editorComment.length > 0 ? data.editorComment : "-"}
                </p>
              </div>
            );
          }}
        />
      </AuthGuard>
    </AssessmentLayout>
  );
};

export default AssessmentReviewerPage;
