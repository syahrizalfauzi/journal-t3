import { useRouter } from "next/router";
import React from "react";
import AuthGuard from "../../../components/AuthGuard";
import AssessmentLayout from "../../../components/layout/AssessmentLayout";
import DetailLayout from "../../../components/layout/dashboard/DetailLayout";
import { parseDate } from "../../../utils/parseDate";
import { parseAssessmentDecision } from "../../../utils/parseDecision";
import { trpc } from "../../../utils/trpc";

const AssessmentAuthorPage = () => {
  const { query } = useRouter();

  if (!query.id) return null;

  const {
    data: assessment,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.assessment.getForAuthor.useQuery(query.id as string);

  return (
    <AssessmentLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="author">
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
                </div>
                <div className="divider divider-vertical m-0 p-0" />
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

                <p className="text-lg font-bold">Comment</p>
                <p>
                  {data.authorComment.length > 0 ? data.authorComment : "-"}
                </p>
              </div>
            );
          }}
        />
      </AuthGuard>
    </AssessmentLayout>
  );
};

export default AssessmentAuthorPage;
