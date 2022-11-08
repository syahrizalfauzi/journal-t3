import React from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../server/trpc/router";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { KeywordBadges } from "./KeywordBadges";
import { parseDate } from "../utils/parseDate";
import { FileInput } from "./FileInput";

type Props = {
  manuscriptDetail: inferProcedureOutput<
    AppRouter["manuscript"]["getForAuthor"]
  >;
  onUpdateOptionalFile: (optionalFile: File) => unknown;
  isLoading: boolean;
};

type OptionalFileForm = {
  optionalFile: FileList;
};

export const ManuscriptDetailCardAuthor = ({
  manuscriptDetail,
  isLoading,
  onUpdateOptionalFile,
}: Props) => {
  const { register, handleSubmit, control } = useForm<OptionalFileForm>();
  const { optionalFile } = useWatch({
    control,
  });

  const onSubmit: SubmitHandler<OptionalFileForm> = ({ optionalFile }) =>
    onUpdateOptionalFile(optionalFile.item(0)!);

  return (
    <form
      className="stretch flex flex-col gap-2 rounded-xl border p-4 shadow-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <p className="text-xl font-bold">Submission Detail</p>
      <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left align-middle">
        <tr>
          <th>ID</th>
          <td>{manuscriptDetail.id}</td>
        </tr>
        <tr>
          <th>Title</th>
          <td>{manuscriptDetail.title}</td>
        </tr>
        <tr>
          <th>Keywords</th>
          <td>
            <KeywordBadges keywords={manuscriptDetail.keywords} />
          </td>
        </tr>
        <tr>
          <th>Authors</th>
          <td>{manuscriptDetail.authors}</td>
        </tr>
        <tr>
          <th className="w-32">Date Created</th>
          <td>{parseDate(manuscriptDetail.createdAt)}</td>
        </tr>
        <tr>
          <th className="w-36">Cover Letter File</th>
          <td>
            <a
              href={manuscriptDetail.coverFileUrl}
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              {manuscriptDetail.coverFileUrl}
            </a>
          </td>
        </tr>
        {manuscriptDetail.optionalFileUrl ? (
          <tr>
            <th className="w-36">Optional File</th>
            <td>
              <a
                href={manuscriptDetail.optionalFileUrl}
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                {manuscriptDetail.optionalFileUrl}
              </a>
            </td>
          </tr>
        ) : (
          <tr className="align-bottom">
            <th className="w-36">Optional File</th>
            <td>
              <FileInput>
                <input
                  {...register("optionalFile")}
                  disabled={isLoading}
                  required
                  type="file"
                />
              </FileInput>
            </td>
          </tr>
        )}
        {optionalFile && optionalFile.length > 0 && (
          <tr>
            <td colSpan={2} className="text-right">
              <input
                disabled={isLoading}
                type="submit"
                value="Submit"
                className="btn btn-info btn-sm text-white"
              />
            </td>
          </tr>
        )}
        <tr>
          <th className="align-top">Abstract</th>
          <td className="whitespace-pre-line break-all">
            {manuscriptDetail.abstract}
          </td>
        </tr>
      </table>
    </form>
  );
};
