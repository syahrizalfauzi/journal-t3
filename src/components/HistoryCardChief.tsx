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
import HistoryCardAction from "./HistoryCardAction";
import SelectOptions from "./SelectOptions";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import FileInput from "./FileInput";
import InputLabel from "./InputLabel";
import { MAX_TEAM_USERS } from "../constants/numbers";
import moment from "moment";

type HistoryCardChiefProps = {
  history: inferProcedureOutput<
    AppRouter["manuscript"]["getForChief"]
  >["history"][number];
  manuscript: Pick<
    inferProcedureOutput<AppRouter["manuscript"]["getForChief"]>,
    "id" | "team"
  >;
  isLoading: boolean;
  withAction: boolean;
  onReject: (reason: string) => unknown;
  onAccept: (file: File, isBlind: boolean) => unknown;
  onUpdateDueDate: (reviewId: string, dueDate: Date) => unknown;
  onReviewReject: (reviewId: string, comment: string) => unknown;
  onReviewRevise: (reviewId: string, comment: string) => unknown;
  onReviewAccept: (reviewId: string, proofreadFile: File) => unknown;
};

type InitialReviewForm = {
  reason: string;
  initialReviewFile: FileList;
  blindType: "0" | "1";
  initialDecision: string;
};
type UpdateDueDateForm = {
  dueDate: Date;
};
type UpdateDecisionForm = {
  comment: string;
  proofreadFile: FileList;
  reviewDecision: string;
};

const HistoryCardChief = ({
  history,
  isLoading,
  manuscript,
  withAction,
  ...callbacks
}: HistoryCardChiefProps) => {
  const { label, color, message } = getStatusProps(history, "chief");
  const initialReviewForm = useForm<InitialReviewForm>({
    defaultValues: {
      initialDecision: "0",
    },
  });
  const updateDueDateForm = useForm<UpdateDueDateForm>();
  const updateDecisionForm = useForm<UpdateDecisionForm>({
    defaultValues: {
      comment: history.review?.comment ?? "",
      reviewDecision: (history.review?.decision ?? 0).toString(),
    },
  });

  const { initialDecision } = useWatch({ control: initialReviewForm.control });
  const { reviewDecision } = useWatch({ control: updateDecisionForm.control });

  const handleInviteReviewers = () =>
    window.open(
      `/invite/${manuscript.id}`,
      "newwindow",
      "width=800,height=1000"
    );
  const handleOpenAssessment = (id: string) =>
    window.open(
      `/assessment/chief/${id}`,
      "newwindow",
      "width=800,height=1000"
    );

  const onSubmitInitialReview: SubmitHandler<InitialReviewForm> = ({
    blindType,
    initialReviewFile,
    initialDecision,
    reason,
  }) => {
    if (initialDecision === "-1") {
      callbacks.onReject(reason);
      return;
    }
    if (initialReviewFile.length <= 0) return;
    const file = initialReviewFile.item(0);
    if (file) callbacks.onAccept(file, blindType === "1");
  };
  const onSubmitSetDueDate: SubmitHandler<UpdateDueDateForm> = ({
    dueDate,
  }) => {
    if (history.review)
      callbacks.onUpdateDueDate(history.review?.id, moment(dueDate).toDate());
  };
  const onSubmitReview: SubmitHandler<UpdateDecisionForm> = ({
    comment,
    proofreadFile,
    reviewDecision,
  }) => {
    if (!history.review) return;
    switch (reviewDecision) {
      case "-1":
        callbacks.onReviewReject(history.review.id, comment);
        break;
      case "1":
        callbacks.onReviewRevise(history.review.id, comment);
        break;
      case "2":
        if (proofreadFile.length <= 0) return;
        const file = proofreadFile.item(0);
        if (file) callbacks.onReviewAccept(history.review.id, file);
        break;
    }
  };

  return (
    <div
      className={`flex flex-col items-stretch gap-2 rounded-xl border p-4 shadow-xl ${
        withAction ? "border-" + color : ""
      }`}
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

        {history.status === -1 && (
          <tr>
            <th>Comment</th>
            <td>{history.submission?.message}</td>
          </tr>
        )}

        {(history.status >= 2 || history.status <= 4) &&
          !!history.review?.dueDate && (
            <tr>
              <th>Due Date</th>
              <td>{parseDate(history.review.dueDate)}</td>
            </tr>
          )}
      </table>

      {(history.status >= 2 || history.status <= 4) &&
        history.review &&
        history.review.dueDate && (
          <>
            <p className="text-xl font-bold">Reviewers</p>
            <table className="border-separate border-spacing-y-2 border-spacing-x-4 self-start text-left align-top">
              {(history.status === 2 || history.status === 4) &&
                manuscript.team?.users.map(({ id, profile }) => {
                  const userAssessment = history.review?.assesment.find(
                    ({ user }) => user.id === id
                  );

                  const { className, label } = parseAssessmentDecision(
                    userAssessment?.decision
                  );

                  return (
                    <tr key={id}>
                      <th>{profile?.name}</th>
                      <td
                        className={classNames(
                          { link: !!userAssessment },
                          className
                        )}
                        onClick={() => {
                          if (userAssessment)
                            handleOpenAssessment(userAssessment.id);
                        }}
                      >
                        {label}
                      </td>
                    </tr>
                  );
                })}

              {history.status === 3 && (
                <>
                  {!!manuscript.team && (
                    <>
                      <tr>
                        <th>Due Date</th>
                        <td>{parseDate(history.review.dueDate)}</td>
                      </tr>
                      {history.review.assesment.map(
                        ({ id, decision, user }) => {
                          const { className, label } =
                            parseAssessmentDecision(decision);

                          return (
                            <tr key={id}>
                              <th>{user.profile?.name}</th>
                              <td
                                className={`link ${className}`}
                                onClick={() => handleOpenAssessment(id)}
                              >
                                {label}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </>
                  )}

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
                </>
              )}
            </table>
          </>
        )}
      {withAction && message.length > 0 && <p>{message}</p>}

      {withAction &&
        (() => {
          switch (history.status) {
            case 0:
              return (
                <form
                  onSubmit={initialReviewForm.handleSubmit(
                    onSubmitInitialReview
                  )}
                >
                  <HistoryCardAction
                    isLoading={isLoading}
                    withSubmit={initialDecision !== "0"}
                    outside={
                      initialDecision === "-1" && (
                        <InputLabel label="Comment">
                          <textarea
                            {...initialReviewForm.register("reason")}
                            disabled={isLoading}
                            required
                            placeholder="Reason of rejection"
                            className="textarea textarea-bordered w-full"
                          />
                        </InputLabel>
                      )
                    }
                  >
                    <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
                      <tr>
                        <th>Initial Review Decision</th>
                        <td>
                          <select
                            {...initialReviewForm.register("initialDecision")}
                            disabled={isLoading}
                            className="select select-bordered select-sm flex-1"
                          >
                            <SelectOptions
                              selectData={[
                                {
                                  label: "Unanswered",
                                  value: "0",
                                  disabled: true,
                                },
                                { label: "Accept", value: "1" },
                                { label: "Reject", value: "-1" },
                              ]}
                            />
                          </select>
                        </td>
                      </tr>
                      {initialDecision === "1" && (
                        <>
                          <tr>
                            <th>Review Type</th>
                            <td>
                              <select
                                {...initialReviewForm.register("blindType")}
                                disabled={isLoading}
                                name="isBlind"
                                className="select select-bordered select-sm flex-1"
                              >
                                <SelectOptions
                                  selectData={[
                                    { label: "Single Blind", value: "0" },
                                    { label: "Double Blind", value: "1" },
                                  ]}
                                />
                              </select>
                            </td>
                          </tr>
                          <tr className="align-bottom">
                            <th>Upload Review-Ready Manuscript</th>
                            <td>
                              <FileInput>
                                <input
                                  {...initialReviewForm.register(
                                    "initialReviewFile"
                                  )}
                                  required
                                  disabled={isLoading}
                                  type="file"
                                />
                              </FileInput>
                            </td>
                          </tr>
                        </>
                      )}
                    </table>
                  </HistoryCardAction>
                </form>
              );
            case 1:
              if (!!manuscript.team)
                return (
                  <HistoryCardAction isLoading={isLoading} withSubmit={false}>
                    <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
                      {manuscript.team.users.length < MAX_TEAM_USERS && (
                        <tr>
                          <td colSpan={2}>
                            <button
                              onClick={handleInviteReviewers}
                              className="btn btn-sm"
                            >
                              Invite Reviewers
                            </button>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th> Number of Reviewers </th>
                        <td>{manuscript.team.users.length}</td>
                      </tr>
                    </table>
                  </HistoryCardAction>
                );
            case 2:
            case 4:
              if (!!history.review && !history.review.dueDate)
                return (
                  <form
                    onSubmit={updateDueDateForm.handleSubmit(
                      onSubmitSetDueDate
                    )}
                  >
                    <HistoryCardAction isLoading={isLoading}>
                      <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
                        <tr>
                          <th> Set Due Date </th>
                          <td>
                            <input
                              {...updateDueDateForm.register("dueDate")}
                              type="datetime-local"
                              required
                              className="input input-bordered"
                            />
                          </td>
                        </tr>
                      </table>
                    </HistoryCardAction>
                  </form>
                );
            case 3:
              if (
                !history.review ||
                history.review.assesment.length < MAX_TEAM_USERS
              )
                return;
              return (
                <form
                  onSubmit={updateDecisionForm.handleSubmit(onSubmitReview)}
                >
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
                      <tr>
                        <th>Review Decision</th>
                        <td>
                          <select
                            {...updateDecisionForm.register("reviewDecision")}
                            className="select select-bordered select-sm flex-1"
                          >
                            <SelectOptions
                              selectData={[
                                {
                                  label: "Unanswered",
                                  value: "0",
                                  disabled: true,
                                },
                                { label: "Reject", value: "-1" },
                                { label: "Revision", value: "1" },
                                { label: "Accept", value: "2" },
                              ]}
                            />
                          </select>
                        </td>
                      </tr>
                      {reviewDecision === "2" && (
                        <tr className="align-bottom">
                          <th>Upload Proofread Article</th>
                          <td>
                            <FileInput>
                              <input
                                {...updateDecisionForm.register(
                                  "proofreadFile"
                                )}
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
              );
            case 6:
              return (
                <HistoryCardAction isLoading={isLoading}>
                  <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
                    <tr>
                      <th>Publish</th>
                      <td>
                        <p>Belum tau ini gimana</p>
                      </td>
                    </tr>
                  </table>
                </HistoryCardAction>
              );
          }
        })()}
    </div>
  );
};

export default HistoryCardChief;
