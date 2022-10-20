import { inferProcedureOutput } from "@trpc/server";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SAMPLE_FILE_URL } from "../constants/others";
import { questionListQuery } from "../server/queries";
import { AppRouter } from "../server/trpc/router";
import { createAssessmentValidator } from "../server/validators/assessment";
import { Sorts } from "../types/SortOrder";
import { toastSettleHandler } from "../utils/toastSettleHandler";
import { trpc } from "../utils/trpc";
import { useQueryOptions } from "../utils/useQueryOptions";
import FileInput from "./FileInput";
import InputLabel from "./InputLabel";
import ListLayout from "./layout/dashboard/ListLayout";
import SelectOptions from "./SelectOptions";

type AssessmentModalProps = {
  review: NonNullable<
    inferProcedureOutput<
      AppRouter["manuscript"]["getForReviewer"]
    >["history"][number]["review"]
  >;
  onSubmit: () => unknown;
};

type CreateAssessmentForm = Pick<
  z.infer<typeof createAssessmentValidator>,
  "authorComment" | "editorComment"
> & {
  decision: string;
  file: FileList;
  chiefFile: FileList;
};

type QueryOptions = typeof questionListQuery;

type ReviewAnswer = {
  reviewQuestionId: string;
  answer: number;
};

const AssessmentModal = ({ review, onSubmit }: AssessmentModalProps) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<CreateAssessmentForm>();
  const createAssessment = trpc.assessment.create.useMutation({
    onSettled: (data, err) => toastSettleHandler(data?.message, err),
  });

  const updateAssessment = trpc.assessment.update.useMutation({
    onSettled: toastSettleHandler,
  });

  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    { sort: "question" },
    []
  );
  const selfAssessmentQuery = trpc.assessment.getForSelfReviewer.useQuery(
    review.id
  );
  const questionListQuery = trpc.question.list.useQuery(queryOptions);

  const [reviewAnswers, setReviewAnswers] = useState<ReviewAnswer[]>([]);

  const isLoading = createAssessment.isLoading || selfAssessmentQuery.isLoading;

  const handleReviewAnswerChange = (questionId: string, value: number) =>
    setReviewAnswers((prevState) => {
      const newAnswerIndex = prevState.findIndex(
        ({ reviewQuestionId }) => reviewQuestionId === questionId
      );
      if (newAnswerIndex === -1) return prevState;

      const newState = prevState;
      newState[newAnswerIndex]!.answer = value;

      return [...newState];
    });

  const handleSubmitCreate = (isDone: boolean) => {
    handleSubmit(({ file, chiefFile, decision, ...data }) => {
      if (!selfAssessmentQuery.data)
        createAssessment.mutate(
          {
            ...data,
            decision: Number(decision),
            reviewAnswers,
            isDone,
            reviewId: review.id,
            fileUrl: file.item(0) ? SAMPLE_FILE_URL : undefined,
            chiefFileUrl: chiefFile.item(0) ? SAMPLE_FILE_URL : undefined,
          },
          {
            onSuccess: ({ id }) => {
              selfAssessmentQuery.refetch();
              onSubmit();
              router.push(`/assessment/reviewer/${id}`);
            },
          }
        );
      else
        updateAssessment.mutate(
          {
            ...data,
            decision: Number(decision),
            reviewAnswers,
            isDone,
            fileUrl: file.item(0) ? SAMPLE_FILE_URL : undefined,
            chiefFileUrl: chiefFile.item(0) ? SAMPLE_FILE_URL : undefined,
            id: selfAssessmentQuery.data.id,
          },
          {
            onSuccess: () => {
              selfAssessmentQuery.refetch();
              onSubmit();
            },
          }
        );
    })();
  };

  useEffect(() => {
    if (!questionListQuery.data) return;
    const newReviewAnswers = questionListQuery.data.questions.map(
      (question) => {
        return {
          reviewQuestionId: question.id,
          answer:
            selfAssessmentQuery.data?.reviewAnswers.find(
              ({ reviewQuestion }) => reviewQuestion.id === question.id
            )?.answer ?? 1,
        };
      }
    );
    // console.log(newReviewAnswers);
    setReviewAnswers([...newReviewAnswers]);
  }, [questionListQuery.data, selfAssessmentQuery.data]);

  useEffect(() => {
    const selfAssessment = selfAssessmentQuery.data;

    reset({
      authorComment: selfAssessment?.authorComment,
      editorComment: selfAssessment?.editorComment,
      decision: (selfAssessment?.decision ?? 0).toString(),
    });
  }, [reset, selfAssessmentQuery.data]);

  return (
    <ListLayout
      queryResult={questionListQuery}
      useQueryOptionsReturn={{ queryOptions, ...rest }}
      paginated={false}
      main={
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col items-stretch gap-4"
        >
          <p className="text-lg font-semibold">Submit Assessment</p>
          {questionListQuery.data?.questions.map(
            ({ id, maxScale, question }, index) => {
              const reviewAnswer = reviewAnswers[index];
              if (!reviewAnswer) return;

              return (
                <Fragment key={id}>
                  <p>{question}</p>
                  <input
                    value={reviewAnswer.answer.toString()}
                    onChange={(e) =>
                      handleReviewAnswerChange(id, Number(e.target.value))
                    }
                    disabled={isLoading}
                    name={id}
                    type="range"
                    min="1"
                    max={maxScale}
                    className="range"
                    step="1"
                  />
                  <div className="flex w-full justify-between px-2 text-xs">
                    {[...Array(maxScale)].map((_, scaleIndex) => (
                      <span key={scaleIndex}>{scaleIndex + 1}</span>
                    ))}
                  </div>
                </Fragment>
              );
            }
          )}
          <InputLabel label="Comment (Author)">
            <textarea
              {...register("authorComment")}
              disabled={isLoading}
              required
              placeholder="Comment to the author"
              className="textarea textarea-bordered w-full"
            />
          </InputLabel>
          <InputLabel label="Comment (Editor)">
            <textarea
              {...register("editorComment")}
              disabled={isLoading}
              required
              placeholder="Comment to the chief editor"
              className="textarea textarea-bordered w-full"
            />
          </InputLabel>
          {!!selfAssessmentQuery.data?.fileUrl && (
            <p>
              File to author :{" "}
              <a className="link" href={selfAssessmentQuery.data?.fileUrl}>
                {selfAssessmentQuery.data?.fileUrl}
              </a>
            </p>
          )}
          {!!selfAssessmentQuery.data?.chiefFileUrl && (
            <p>
              File to chief editor :{" "}
              <a className="link" href={selfAssessmentQuery.data?.chiefFileUrl}>
                {selfAssessmentQuery.data?.chiefFileUrl}
              </a>
            </p>
          )}
          <FileInput label="Optional File (to author)">
            <input {...register("file")} disabled={isLoading} type="file" />
          </FileInput>
          <FileInput label="Optional File (to chief editor)">
            <input
              {...register("chiefFile")}
              disabled={isLoading}
              type="file"
            />
          </FileInput>
          <select
            {...register("decision")}
            disabled={isLoading}
            id="gender"
            required
            className="select select-bordered flex-1"
          >
            <SelectOptions
              selectData={[
                { label: "Unanswered", value: "0", disabled: true },
                { label: "Reject", value: "-1" },
                { label: "Major Revision", value: "1" },
                { label: "Minor Revision", value: "2" },
                { label: "Accept", value: "3" },
              ]}
            />
          </select>
          <div className="flex flex-row justify-end gap-4">
            <input
              disabled={isLoading}
              onClick={() => handleSubmitCreate(false)}
              value="Save Draft"
              className="btn btn-outline"
            />
            <input
              disabled={isLoading}
              onClick={() => handleSubmitCreate(true)}
              value="Submit Assessment"
              className="btn"
            />
          </div>
        </form>
      }
    />
  );
};

export default AssessmentModal;
