import React, { useEffect } from "react";
import type { NextPage } from "next/types";
import { RootLayout } from "../../components/layout/RootLayout";
import { DetailLayout } from "../../components/layout/dashboard/DetailLayout";
import { useRouter } from "next/router";
import { Checkboxes } from "../../components/Checkboxes";
import { ensureRouterQuery } from "../../components/hoc/ensureRouterQuery";
import { InputLabel } from "../../components/InputLabel";
import { KeywordBadges } from "../../components/KeywordBadges";
import { parseDateDay } from "../../utils/parseDate";
import { trpc } from "../../utils/trpc";
import register from "../auth/register";

const ArchiveDetailPage: NextPage = () => {
  const { query } = useRouter();

  const {
    data: edition,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.edition.get.useQuery(query.id as string);

  return (
    <RootLayout>
      <div className="container py-12">
        <DetailLayout
          isLoading={queryLoading}
          data={edition}
          errorMessage={queryError?.message}
          render={(data) => (
            <div className="flex flex-col gap-4">
              <p className="text-3xl font-bold">{data.name}</p>
              <p className="text-gray-300">DOI : {data.doi}</p>
              {data.manuscripts.length > 0 && (
                <p className="text-xl font-medium">Articles</p>
              )}
              {data.manuscripts.map(
                ({ authors, id, keywords, latestHistory, title }) => {
                  if (!latestHistory || !latestHistory.history.submission)
                    return null;
                  return (
                    <a
                      key={id}
                      className="pointer pointer flex flex-col gap-1 rounded-xl border bg-white p-4 shadow-xl duration-100 hover:bg-gray-100"
                      href={latestHistory?.history.submission?.fileUrl}
                    >
                      <p className="text-lg font-medium">{title}</p>
                      <p className="italic">{authors}</p>
                      <KeywordBadges keywords={keywords} />
                      {!!latestHistory && (
                        <p className="text-gray-400">
                          Available{" "}
                          {parseDateDay(latestHistory?.history.updatedAt)}
                        </p>
                      )}
                    </a>
                  );
                }
              )}
            </div>
          )}
        />
      </div>
    </RootLayout>
  );
};

export default ensureRouterQuery("id", ArchiveDetailPage);
