import { useRouter } from "next/router";
import React from "react";
import { AssessmentModal } from "../../../../components/AssessmentModal";
import { AuthGuard } from "../../../../components/AuthGuard";
import { ensureRouterQuery } from "../../../../components/hoc/ensureRouterQuery";
import { AssessmentLayout } from "../../../../components/layout/AssessmentLayout";
import { trpc } from "../../../../utils/trpc";

const CreateAssessmentPage = () => {
  const { query } = useRouter();

  const { refetch: refetchAssignment } =
    trpc.manuscript.getForReviewer.useQuery(query.manuscriptId as string);
  const { data } = trpc.review.get.useQuery(query.id as string);

  return (
    <AssessmentLayout>
      <AuthGuard redirectTo="/dashboard" allowedRole="reviewer">
        {data && (
          <AssessmentModal
            review={data}
            onSubmit={() => {
              refetchAssignment();
            }}
          />
        )}
      </AuthGuard>
    </AssessmentLayout>
  );
};

export default ensureRouterQuery("manuscriptId", CreateAssessmentPage);
