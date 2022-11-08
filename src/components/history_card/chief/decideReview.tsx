import { inferProcedureOutput } from "@trpc/server";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { REVIEW_DECISION } from "../../../constants/numbers";
import { AppRouter } from "../../../server/trpc/router";
import { capitalizeCamelCase } from "../../../utils/capitalizeCamelCase";
import { trpc } from "../../../utils/trpc";
import { FileInput } from "../../FileInput";
import { HistoryCardAction } from "../../HistoryCardAction";
import { InputLabel } from "../../InputLabel";
import { SelectOptions } from "../../SelectOptions";

type UpdateDecisionForm = {
  comment: string;
  proofreadFile: FileList;
  reviewDecision: "-1" | "0" | "1" | "2";
};
type Props = {
  isLoading: boolean;
  history: inferProcedureOutput<
    AppRouter["manuscript"]["getForChief"]
  >["history"][number];
  onReviewReject: (reviewId: string, comment: string) => unknown;
  onReviewRevise: (reviewId: string, comment: string) => unknown;
  onReviewAccept: (reviewId: string, proofreadFile: File) => unknown;
};

export const HistoryCardChiefDecideReview = ({
  isLoading,
  history,
  onReviewAccept,
  onReviewReject,
  onReviewRevise,
}: Props) => {
  const updateDecisionForm = useForm<UpdateDecisionForm>({
    defaultValues: {
      comment: history.review?.comment ?? "",
      reviewDecision: (history.review?.decision ?? 0).toString() as
        | "-1"
        | "0"
        | "1"
        | "2",
    },
  });
  const { reviewDecision } = useWatch({ control: updateDecisionForm.control });
  const { data } = trpc.settings.get.useQuery();

  const onSubmitReview: SubmitHandler<UpdateDecisionForm> = ({
    comment,
    proofreadFile,
    reviewDecision,
  }) => {
    if (!history.review) return;
    switch (Number(reviewDecision)) {
      case REVIEW_DECISION.rejected:
        onReviewReject(history.review.id, comment);
        break;
      case REVIEW_DECISION.revision:
        onReviewRevise(history.review.id, comment);
        break;
      case REVIEW_DECISION.accepted:
        if (proofreadFile.length <= 0) return;
        const file = proofreadFile.item(0);
        if (file) onReviewAccept(history.review.id, file);
        break;
    }
  };

  if (
    !history.review ||
    !data ||
    history.review.assesment.length < data?.reviewersCount
  )
    return null;
  return (
    <form onSubmit={updateDecisionForm.handleSubmit(onSubmitReview)}>
      <HistoryCardAction
        isLoading={isLoading}
        withSubmit={reviewDecision !== "0"}
        outside={
          (reviewDecision === "-1" || reviewDecision === "1") && (
            <InputLabel label="Comment">
              <textarea
                {...updateDecisionForm.register("comment")}
                disabled={isLoading}
                required
                placeholder="Review comment"
                className="textarea textarea-bordered w-full"
              />
            </InputLabel>
          )
        }
      >
        <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
          <tbody>
            <tr>
              <th>Review Decision</th>
              <td>
                <select
                  {...updateDecisionForm.register("reviewDecision")}
                  className="select select-bordered select-sm flex-1"
                >
                  <SelectOptions
                    selectData={Object.entries(REVIEW_DECISION).map(
                      ([key, value]) => ({
                        disabled: value === 0,
                        label: capitalizeCamelCase(key),
                        value: value.toString(),
                      })
                    )}
                  />
                </select>
              </td>
            </tr>
            {reviewDecision === REVIEW_DECISION.accepted.toString() && (
              <tr className="align-bottom">
                <th>Upload Proofread Article</th>
                <td>
                  <FileInput>
                    <input
                      {...updateDecisionForm.register("proofreadFile")}
                      required
                      disabled={isLoading}
                      type="file"
                    />
                  </FileInput>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </HistoryCardAction>
    </form>
  );
};
