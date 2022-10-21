import React from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../server/trpc/router";
import getStatusProps from "../utils/getStatusProps";
import parseDate from "../utils/parseDate";
import {
  parseAssessmentDecision,
  parseReviewDecision,
} from "../utils/parseDecision";
import classNames from "classnames";
import HistoryCardAction from "./HistoryCardAction";
import SelectOptions from "./SelectOptions";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import FileInput from "./FileInput";

type HistoryCardAuthorProps = {
  history: NonNullable<
    inferProcedureOutput<
      AppRouter["manuscript"]["getForAuthor"]
    >["latestHistory"]
  >["history"];
  isLoading: boolean;
  onRevise: (file: File) => unknown;
  onFinalize: (file: File | undefined | null) => unknown;
};

type ReviseForm = {
  revisionFile: FileList;
};

type FinalizeForm = {
  finalizeDecision: string;
  finalizeFile: FileList;
};

const HistoryCardAuthor = ({
  history,
  isLoading,
  onRevise,
  onFinalize,
}: HistoryCardAuthorProps) => {
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
              {history.submission?.fileUrl}
            </a>
          </td>
        </tr>

        {history.status === 3 &&
          !!history.review &&
          history.review.decision !== 0 && (
            <>
              {history.review.assesment
                .filter(({ decision }) => decision !== 0)
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
                    "text-success": history.review.decision === 2,
                    "text-warning": history.review.decision === 1,
                    "text-error": history.review.decision === -1,
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
        {history.status === -1 && (
          <tr>
            <th>Comment</th>
            <td>{history.submission?.message}</td>
          </tr>
        )}
      </table>

      {message.length > 0 && <p>{message}</p>}

      {history.status === 3 && (history.review?.decision ?? 0) === 1 && (
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
                    />
                  </FileInput>
                </td>
              </tr>
            </table>
          </HistoryCardAction>
        </form>
      )}
      {history.status === 5 && (
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
                      selectData={[
                        { label: "Unanswered", value: "0", disabled: true },
                        { label: "No Revision", value: "-1" },
                        { label: "Revision", value: "1" },
                      ]}
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

export default HistoryCardAuthor;
