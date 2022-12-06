import React from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../server/trpc/router";
import getStatusProps from "../utils/getStatusProps";
import { parseDate } from "../utils/parseDate";
import {
  parseAssessmentDecision,
  parseReviewDecision,
} from "../utils/parseDecision";
import classNames from "classnames";
import { HistoryCardAction } from "./HistoryCardAction";
import { SelectOptions } from "./SelectOptions";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { FileInput } from "./FileInput";
import {
  ASSESSMENT_DECISION,
  HISTORY_STATUS,
  PROOFREAD_DECISION,
  REVIEW_DECISION,
} from "../constants/numbers";
import { capitalizeCamelCase } from "../utils/capitalizeCamelCase";
import { ellipsifyText } from "../utils/ellipsifyText";
import { FILE_ACCEPTS } from "../constants/others";

type Props = {
  history: NonNullable<
    inferProcedureOutput<
      AppRouter["manuscript"]["getForAuthor"]
    >["latestHistory"]
  >["history"];
  isLoading: boolean;
  onRevise: (file: File) => Promise<unknown>;
  onFinalize: (file: File | undefined | null) => Promise<unknown>;
};

type ReviseForm = {
  revisionFile: FileList;
};

type FinalizeForm = {
  finalizeDecision: string;
  finalizeFile: FileList;
};

export const HistoryCardAuthor = ({
  history,
  isLoading,
  onRevise,
  onFinalize,
}: Props) => {
  const { label, color, message } = getStatusProps(history, "author");
  const reviseForm = useForm<ReviseForm>();
  const finalizeForm = useForm<FinalizeForm>();
  const { finalizeDecision } = useWatch({
    control: finalizeForm.control,
  });

  const handleOpenAssessment = (id: string) =>
    window.open(
      `/assessment/author/${id}`,
      "newwindow",
      "width=800,height=1000"
    );

  const onSubmitRevise: SubmitHandler<ReviseForm> = ({ revisionFile }) => {
    if (revisionFile.length <= 0) return;
    const file = revisionFile.item(0);
    if (file) return onRevise(file);
  };
  const onSubmitFinalize: SubmitHandler<FinalizeForm> = ({ finalizeFile }) =>
    onFinalize(finalizeFile?.item(0) as File | null | undefined);

  return (
    <div
      className={`flex flex-col items-stretch gap-2 rounded-xl border p-4 shadow-xl border-${color}`}
    >
      <p className="text-xl font-bold"> Status : {label}</p>
      <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left align-top">
        <tr>
          <th>Last Updated</th>
          <td>{parseDate(history.updatedAt)}</td>
        </tr>
        <tr>
          <th>Latest File</th>
          <td>
            <a
              href={history.submission?.fileUrl}
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              {ellipsifyText(history.submission?.fileUrl)}
            </a>
          </td>
        </tr>

        {history.status === HISTORY_STATUS.reviewed &&
          !!history.review &&
          history.review.decision !== REVIEW_DECISION.unanswered && (
            <>
              {history.review.assesment
                .filter(
                  ({ decision }) => decision !== ASSESSMENT_DECISION.unanswered
                )
                .map(({ id, decision }, index) => {
                  const { label, className } =
                    parseAssessmentDecision(decision);
                  return (
                    <tr key={id}>
                      <th>Reviewer {index + 1}</th>
                      <td
                        onClick={() => handleOpenAssessment(id)}
                        className={`link ${className}`}
                      >
                        {label}
                      </td>
                    </tr>
                  );
                })}

              <tr>
                <th>Decision</th>
                <td
                  className={classNames({
                    "text-success":
                      history.review.decision === REVIEW_DECISION.accepted,
                    "text-warning":
                      history.review.decision === REVIEW_DECISION.revision,
                    "text-error":
                      history.review.decision === REVIEW_DECISION.rejected,
                  })}
                >
                  {parseReviewDecision(history.review.decision)}
                </td>
              </tr>
              {(history.review.comment?.length ?? 0) > 0 && (
                <tr>
                  <th>Comment</th>
                  <td>{history.review.comment}</td>
                </tr>
              )}
            </>
          )}
        {history.status === HISTORY_STATUS.rejected && (
          <tr>
            <th>Comment</th>
            <td>{history.submission?.message}</td>
          </tr>
        )}
      </table>

      {message.length > 0 && <p>{message}</p>}

      {history.status === HISTORY_STATUS.reviewed &&
        (history.review?.decision ?? 0) === REVIEW_DECISION.revision && (
          <form onSubmit={reviseForm.handleSubmit(onSubmitRevise)}>
            <HistoryCardAction isLoading={isLoading}>
              <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
                <tr className="align-bottom">
                  <th>Upload Revision</th>
                  <td>
                    <FileInput>
                      <input
                        {...reviseForm.register("revisionFile")}
                        required
                        disabled={isLoading}
                        type="file"
                        accept={FILE_ACCEPTS}
                      />
                    </FileInput>
                  </td>
                </tr>
              </table>
            </HistoryCardAction>
          </form>
        )}
      {history.status === HISTORY_STATUS.proofread && (
        <form onSubmit={finalizeForm.handleSubmit(onSubmitFinalize)}>
          <HistoryCardAction
            isLoading={isLoading}
            withSubmit={finalizeDecision !== "0"}
          >
            <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
              <tr>
                <th>Decision</th>
                <td>
                  <select
                    {...finalizeForm.register("finalizeDecision")}
                    disabled={isLoading}
                    className="select select-bordered select-sm flex-1"
                  >
                    <SelectOptions
                      selectData={Object.entries(PROOFREAD_DECISION).map(
                        ([key, value]) => ({
                          disabled: value === 0,
                          value: value.toString(),
                          label: capitalizeCamelCase(key),
                        })
                      )}
                    />
                  </select>
                </td>
              </tr>
              {finalizeDecision === "1" && (
                <tr className="align-bottom">
                  <th>Upload Revision</th>
                  <td>
                    <FileInput>
                      <input
                        {...finalizeForm.register("finalizeFile")}
                        required
                        disabled={isLoading}
                        type="file"
                        accept={FILE_ACCEPTS}
                      />
                    </FileInput>
                  </td>
                </tr>
              )}
            </table>
          </HistoryCardAction>
        </form>
      )}
    </div>
  );
};
