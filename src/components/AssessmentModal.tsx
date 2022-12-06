import { inferProcedureOutput } from "@trpc/server";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ASSESSMENT_DECISION } from "../constants/numbers";
import { FILE_ACCEPTS, FOLDER_NAMES } from "../constants/others";
import { questionListQuery } from "../server/queries";
import { AppRouter } from "../server/trpc/router";
import { createAssessmentValidator } from "../server/validators/assessment";
import { Sorts } from "../types/SortOrder";
import { capitalizeCamelCase } from "../utils/capitalizeCamelCase";
import { toastSettleHandler } from "../utils/toastSettleHandler";
import { trpc } from "../utils/trpc";
import { deleteFile, uploadFile } from "../utils/firebaseStorage";
import { useQueryOptions } from "../utils/useQueryOptions";
import { FileInput } from "./FileInput";
import { InputLabel } from "./InputLabel";
import ListLayout from "./layout/dashboard/ListLayout";
import { SelectOptions } from "./SelectOptions";
import { ellipsifyText } from "../utils/ellipsifyText";

type Props = {
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
  [key: string]: string;
};

type AssessmentFiles = {
  chiefFileUrl?: string | null;
  fileUrl?: string | null;
};

export const AssessmentModal = ({ review, onSubmit }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<CreateAssessmentForm>();
  const createAssessment = trpc.assessment.create.useMutation({
    onSettled: (data, err) => toastSettleHandler(data?.message, err),
  });

  const updateAssessment = trpc.assessment.update.useMutation({
    onSettled: (data, err) => toastSettleHandler(data?.message, err),
  });

  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    { sort: "question" },
    []
  );
  const selfAssessmentQuery = trpc.assessment.getForSelfReviewer.useQuery(
    review.id
  );
  const [selfAssessmentFiles, setSelfAssessmentFiles] =
    useState<AssessmentFiles>({});
  const questionListQuery = trpc.question.list.useQuery(queryOptions);

  const [reviewAnswers, setReviewAnswers] = useState<ReviewAnswer>({});

  const [isUploading, setIsUploading] = useState(false);

  const isLoading =
    createAssessment.isLoading || selfAssessmentQuery.isLoading || isUploading;

  const handleReviewAnswerChange = (questionId: string, value: number) =>
    setReviewAnswers((prevState) => {
      return {
        ...prevState,
        [questionId]: value.toString(),
      };
    });

  const handleSubmitCreate = (isDone: boolean) => {
    handleSubmit(async ({ file, chiefFile, decision, ...data }) => {
      const defineFileUrl = async (
        fileList: FileList,
        existingFileUrl: string | null | undefined
      ) => {
        const file = fileList[0];
        if (!file) return undefined;

        const upload = uploadFile(file, FOLDER_NAMES.assessmentFiles);
        let deletion: Promise<void> | undefined = undefined;

        if (existingFileUrl) {
          deletion = deleteFile(existingFileUrl);
        }

        const [url] = await Promise.all([upload, deletion]);

        return url;
      };

      setIsUploading(true);
      const [fileUrl, chiefFileUrl] = await Promise.all([
        defineFileUrl(file, selfAssessmentFiles.fileUrl),
        defineFileUrl(chiefFile, selfAssessmentFiles.chiefFileUrl),
      ]);
      setIsUploading(false);

      if (!selfAssessmentQuery.data)
        createAssessment.mutate(
          {
            ...data,
            decision: Number(decision),
            reviewAnswers: Object.entries(reviewAnswers).map(
              ([reviewQuestionId, answer]) => ({
                reviewQuestionId,
                answer: Number(answer),
              })
            ),
            isDone,
            reviewId: review.id,
            fileUrl,
            chiefFileUrl,
            // fileUrl: file.item(0) ? SAMPLE_FILE_URL : undefined,
            // chiefFileUrl: chiefFile.item(0) ? SAMPLE_FILE_URL : undefined,
          },
          {
            onSuccess: ({ id }) => {
              selfAssessmentQuery.refetch();
              onSubmit();
              reset();
              if (isDone) router.push(`/assessment/reviewer/${id}`);
            },
          }
        );
      else
        updateAssessment.mutate(
          {
            ...data,
            decision: Number(decision),
            reviewAnswers: Object.entries(reviewAnswers).map(
              ([reviewQuestionId, answer]) => ({
                reviewQuestionId,
                answer: Number(answer),
              })
            ),
            isDone,
            fileUrl: fileUrl ?? selfAssessmentFiles.fileUrl,
            chiefFileUrl: chiefFileUrl ?? selfAssessmentFiles.chiefFileUrl,
            // fileUrl: file.item(0)
            //   ? SAMPLE_FILE_URL
            //   : selfAssessmentFiles.fileUrl,
            // chiefFileUrl: chiefFile.item(0)
            //   ? SAMPLE_FILE_URL
            //   : selfAssessmentFiles.chiefFileUrl,
            id: selfAssessmentQuery.data.id,
          },
          {
            onSuccess: ({ id }) => {
              selfAssessmentQuery.refetch();
              onSubmit();
              reset();
              if (isDone) router.push(`/assessment/reviewer/${id}`);
            },
          }
        );
    })();
  };

  const handleDeleteFileUrl = async () => {
    if (
      !confirm("Are you sure you want to delete this file?") ||
      !selfAssessmentFiles.fileUrl
    ) {
      return;
    }

    setIsUploading(true);
    await deleteFile(selfAssessmentFiles.fileUrl);
    setIsUploading(false);
    setSelfAssessmentFiles((prevState) => ({
      ...prevState,
      fileUrl: null,
    }));
  };

  const handleDeleteChiefFileUrl = async () => {
    if (
      !confirm("Are you sure you want to delete this file?") ||
      !selfAssessmentFiles.chiefFileUrl
    ) {
      return;
    }

    setIsUploading(true);
    await deleteFile(selfAssessmentFiles.chiefFileUrl);
    setIsUploading(false);
    setSelfAssessmentFiles((prevState) => ({
      ...prevState,
      chiefFileUrl: null,
    }));
  };

  useEffect(() => {
    if (!questionListQuery.data) return;
    const newReviewAnswers = Object.fromEntries(
      questionListQuery.data.questions.map(({ id }) => [
        id,
        (
          selfAssessmentQuery.data?.reviewAnswers.find(
            ({ reviewQuestion }) => reviewQuestion.id === id
          )?.answer ?? 1
        ).toString(),
      ])
    );
    setReviewAnswers({ ...newReviewAnswers });
  }, [questionListQuery.data, reset, selfAssessmentQuery.data]);

  useEffect(() => {
    const selfAssessment = selfAssessmentQuery.data;

    reset({
      authorComment: selfAssessment?.authorComment,
      editorComment: selfAssessment?.editorComment,
      decision: (selfAssessment?.decision ?? 0).toString(),
      file: undefined,
      chiefFile: undefined,
    });

    setSelfAssessmentFiles({
      chiefFileUrl: selfAssessment?.chiefFileUrl,
      fileUrl: selfAssessment?.fileUrl,
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
          className="flex w-full flex-col items-stretch gap-4"
        >
          <p className="text-lg font-semibold">
            Submit Assessment {!!selfAssessmentQuery.data && "(Draft Loaded)"}
          </p>
          {questionListQuery.data?.questions.map(
            ({ id, maxScale, question }) => {
              const reviewAnswer = reviewAnswers[id];
              if (!reviewAnswer) return;

              return (
                <Fragment key={id}>
                  <p>{question}</p>
                  <input
                    value={reviewAnswer}
                    onChange={(e) =>
                      handleReviewAnswerChange(id, Number(e.target.value))
                    }
                    name={id}
                    disabled={isLoading}
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
          <FileInput label="Optional File (to author)">
            {!!selfAssessmentFiles.fileUrl && (
              <div className="flex flex-row gap-4">
                <button
                  onClick={handleDeleteFileUrl}
                  className="btn btn-error btn-sm self-start text-white"
                >
                  Delete
                </button>
                <a
                  className="link overflow-clip"
                  href={selfAssessmentFiles.fileUrl}
                >
                  {ellipsifyText(selfAssessmentFiles.fileUrl)}
                </a>
              </div>
            )}
            <input
              {...register("file")}
              disabled={isLoading}
              type="file"
              accept={FILE_ACCEPTS}
            />
          </FileInput>
          <FileInput label="Optional File (to chief editor)">
            {!!selfAssessmentFiles.chiefFileUrl && (
              <div className="flex flex-row gap-4">
                <button
                  onClick={handleDeleteChiefFileUrl}
                  className="btn btn-error btn-sm self-start text-white"
                >
                  Delete
                </button>
                <a
                  className="link overflow-clip"
                  href={selfAssessmentFiles.chiefFileUrl}
                >
                  {ellipsifyText(selfAssessmentFiles.chiefFileUrl)}
                </a>
              </div>
            )}
            <input
              {...register("chiefFile")}
              disabled={isLoading}
              type="file"
              accept={FILE_ACCEPTS}
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
              selectData={Object.entries(ASSESSMENT_DECISION).map(
                ([key, value], index) => ({
                  label: capitalizeCamelCase(key),
                  value: value.toString(),
                  disabled: index === 0,
                })
              )}
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
