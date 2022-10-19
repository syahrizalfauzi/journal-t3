import React from "react";
import type { NextPage } from "next/types";
import InputLabel from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { manuscriptValidator } from "../../../../server/validators/manuscript";
import { useRouter } from "next/router";
import DashboardAuthorLayout from "../../../../components/layout/dashboard/DashboardAuthorLayout";
import FileInput from "../../../../components/FileInput";
import { SAMPLE_FILE_URL } from "../../../../constants/others";

type CreateManuscriptForm = Omit<
  z.infer<typeof manuscriptValidator>,
  "fileUrl" | "coverFileUrl"
> & {
  file: FileList;
  coverFile: FileList;
};
const DashboardAuthorSubmissionsCreatePage: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<CreateManuscriptForm>();
  const { mutate, isLoading } = trpc.manuscript.create.useMutation({
    onError: (err) => toastSettleHandler(undefined, err),
  });

  const onSubmit: SubmitHandler<CreateManuscriptForm> = (data) => {
    console.log("TODO : Submission create, upload file");
    mutate(
      {
        ...data,
        coverFileUrl: SAMPLE_FILE_URL,
        fileUrl: SAMPLE_FILE_URL,
      },
      {
        onSuccess: ({ id }) =>
          router.push(`/dashboard/author/submissions/${id}`),
      }
    );
  };

  return (
    <DashboardAuthorLayout>
      <p className="text-xl font-medium">Submit Manuscript</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-lg font-medium">Account</p>
        <InputLabel label="Title">
          <input
            {...register("title")}
            disabled={isLoading}
            type="text"
            placeholder="Title"
            className="input input-bordered w-full"
            required
          />
        </InputLabel>
        <InputLabel label="Authors">
          <input
            {...register("authors")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Authors"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Abstract">
          <textarea
            {...register("abstract")}
            disabled={isLoading}
            required
            placeholder="Abstract"
            className="textarea textarea-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Keywords">
          <input
            {...register("keywords")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Keywords (comma separated)"
            className="input input-bordered w-full"
          />
        </InputLabel>

        <FileInput label="Upload Cover Letter File">
          <input
            {...register("coverFile")}
            disabled={isLoading}
            required
            type="file"
          />
        </FileInput>
        <FileInput label="Upload Manuscript File">
          <input
            {...register("file")}
            disabled={isLoading}
            required
            type="file"
          />
        </FileInput>
        <input
          disabled={isLoading}
          type="submit"
          value="Submit"
          className="btn"
        />
      </form>
    </DashboardAuthorLayout>
  );
};

export default DashboardAuthorSubmissionsCreatePage;
