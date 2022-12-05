import React, { useState } from "react";
import type { NextPage } from "next/types";
import { InputLabel } from "../../../../components/InputLabel";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { z } from "zod";
import {
  showErrorToast,
  toastSettleHandler,
} from "../../../../utils/toastSettleHandler";
import { manuscriptValidator } from "../../../../server/validators/manuscript";
import { useRouter } from "next/router";
import { DashboardAuthorLayout } from "../../../../components/layout/dashboard/DashboardAuthorLayout";
import { FileInput } from "../../../../components/FileInput";
import { MAX_FILE_SIZE } from "../../../../constants/numbers";
import { uploadFile } from "../../../../utils/firebaseStorage";
import { FILE_ACCEPTS, FOLDER_NAMES } from "../../../../constants/others";

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
  const { mutate, isLoading: mutateLoading } =
    trpc.manuscript.create.useMutation({
      onError: (err) => toastSettleHandler(undefined, err),
    });
  const [isUploading, setIsUploading] = useState(false);

  const isLoading = mutateLoading || isUploading;

  const onSubmit: SubmitHandler<CreateManuscriptForm> = async (data) => {
    if (!data.coverFile[0] || !data.file[0]) return;

    if (data.coverFile[0].size > MAX_FILE_SIZE) {
      showErrorToast("Cover file size must be less than 10MB");
      return;
    }

    if (data.file[0].size > MAX_FILE_SIZE) {
      showErrorToast("Manuscript file size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    const coverFileUpload = uploadFile(
      data.coverFile[0],
      FOLDER_NAMES.coverFiles
    );
    const fileUpload = uploadFile(data.file[0], FOLDER_NAMES.manuscripts);

    const [coverFileUrl, fileUrl] = await Promise.all([
      coverFileUpload,
      fileUpload,
    ]);

    setIsUploading(false);

    mutate(
      {
        ...data,
        coverFileUrl,
        fileUrl,
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
            accept={FILE_ACCEPTS}
          />
        </FileInput>
        <FileInput label="Upload Manuscript File">
          <input
            {...register("file")}
            disabled={isLoading}
            required
            type="file"
            accept={FILE_ACCEPTS}
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
