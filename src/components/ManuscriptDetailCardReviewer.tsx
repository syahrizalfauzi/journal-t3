import React from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../server/trpc/router";
import { KeywordBadges } from "./KeywordBadges";
import { parseDate } from "../utils/parseDate";
import { ellipsifyText } from "../utils/ellipsifyText";

type ManuscriptDetailCardReviewerProps = {
  manuscriptDetail: inferProcedureOutput<
    AppRouter["manuscript"]["getForReviewer"]
  >;
};

export const ManuscriptDetailCardReviewer = ({
  manuscriptDetail,
}: ManuscriptDetailCardReviewerProps) => {
  return (
    <div className="stretch flex flex-col gap-2 rounded-xl border p-4 shadow-xl">
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
        {!manuscriptDetail.isBlind && (
          <>
            <tr>
              <th>Authors</th>
              <td>{manuscriptDetail.authors}</td>
            </tr>
            <tr>
              <th>Submitted By</th>
              <td>{manuscriptDetail.author.profile!.name}</td>
            </tr>
          </>
        )}
        {(manuscriptDetail.history[0]?.status ?? 0) > 0 && (
          <tr>
            <th>Review Type</th>
            <td>
              {manuscriptDetail.isBlind ? "Double Blind" : "Single Blind"}
            </td>
          </tr>
        )}
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
              {ellipsifyText(manuscriptDetail.coverFileUrl)}
            </a>
          </td>
        </tr>
        {manuscriptDetail.optionalFileUrl && (
          <tr>
            <th className="w-36">Optional File</th>
            <td>
              <a
                href={manuscriptDetail.optionalFileUrl}
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                {ellipsifyText(manuscriptDetail.optionalFileUrl)}
              </a>
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
    </div>
  );
};
