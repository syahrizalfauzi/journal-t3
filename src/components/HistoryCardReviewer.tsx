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
import { useSession } from "next-auth/react";

type Manuscript = inferProcedureOutput<
  AppRouter["manuscript"]["getForReviewer"]
>;

type HistoryCardReviewerProps = {
  history: Manuscript["history"][number];
  manuscript: Pick<Manuscript, "id" | "team">;
  withAction: boolean;
};

export const HistoryCardReviewer = ({
  history,
  manuscript,
  withAction,
}: HistoryCardReviewerProps) => {
  const { data: currentUser } = useSession();
  const selfAssessment = history.review?.assesment.find(
    ({ user }) => user.id === currentUser?.user.id
  );

  const { label, color, message } = getStatusProps(
    history,
    "reviewer",
    !!selfAssessment,
    !!selfAssessment?.isDone
  );

  const handleOpenAssessment = (id: string) =>
    window.open(
      `/assessment/reviewer/${id}`,
      "newwindow",
      "width=800,height=1000"
    );

  const handleOpenSelfAssessment = () => {
    if (!selfAssessment) return;
    window.open(
      `/assessment/reviewer/${selfAssessment.id}`,
      "newwindow",
      "width=800,height=1000"
    );
  };

  const handleCreateAssessment = () => {
    if (!history.review) return;
    window.open(
      `/assessment/create/${manuscript.id}/${history.review?.id}`,
      "newwindow",
      "width=800,height=1000"
    );
  };
  return (
    <div
      className={classNames(
        `flex flex-col items-start gap-2 rounded-xl border p-4 shadow-xl border-${color}`,
        { "border-success": !!selfAssessment?.isDone && history.status === 2 }
      )}
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
        {!!history.review?.dueDate && (
          <tr>
            <th>Due Date</th>
            <td className="font-bold">{parseDate(history.review.dueDate)}</td>
          </tr>
        )}
      </table>

      {history.status === 3 &&
        !!history.review &&
        !!manuscript.team &&
        !!currentUser && (
          <>
            <p className="text-xl font-bold">Reviewers</p>
            <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left align-top">
              {history.review.assesment.map(({ decision, id, user }, index) => {
                const { className, label } = parseAssessmentDecision(decision);

                return (
                  <tr key={id}>
                    <th>
                      {user.id === currentUser.user.id
                        ? currentUser.user.profile.name
                        : `Reviewer ${index + 1}`}
                    </th>
                    <td
                      onClick={() => handleOpenAssessment(id)}
                      className={classNames(className, {
                        link: decision !== 0,
                      })}
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
            </table>
          </>
        )}

      {withAction && message.length > 0 && <p>{message}</p>}

      {withAction &&
        (history.status === 2 || history.status === 4) &&
        !!history.review?.dueDate && (
          <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
            {!!selfAssessment?.isDone ? (
              <tr>
                <td colSpan={2}>
                  <button
                    onClick={handleOpenSelfAssessment}
                    className="btn btn-sm"
                  >
                    Open Submitted Assesment
                  </button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={2}>
                  <button
                    // onClick={() => onAssess(history.review)}
                    onClick={handleCreateAssessment}
                    className="btn btn-sm"
                  >
                    Open Assesment Window
                  </button>
                </td>
              </tr>
            )}
          </table>
        )}
    </div>
  );
};
