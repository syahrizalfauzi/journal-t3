import React, { useState } from "react";
import { NextPage } from "next/types";
import DashboardAuthorLayout from "../../../../components/layout/dashboard/DashboardAuthorLayout";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import getSortOrder from "../../../../utils/getSortOrder";
import { MANUSCRIPT_AUTHOR_SORTS } from "../../../../constants/sorts";
import { manuscriptAuthorQuery } from "../../../../server/queries";
import { trpc } from "../../../../utils/trpc";
import Link from "next/link";
import parseDate from "../../../../utils/parseDate";
import KeywordBadges from "../../../../components/KeywordBadges";
import StatusBadge from "../../../../components/StatusBadge";
import { ListQuery } from "../../../../types/ListQuery";

const sortOrders = getSortOrder(MANUSCRIPT_AUTHOR_SORTS);
type ManuscriptAuthorSorts = typeof MANUSCRIPT_AUTHOR_SORTS[number];
type ManuscriptAuthorQuery = ListQuery<
  typeof manuscriptAuthorQuery,
  ManuscriptAuthorSorts
>;

const DashboardAuthorSubmissionsPage: NextPage = () => {
  const [queryOptions, setQueryOptions] = useState<ManuscriptAuthorQuery>({
    sort: sortOrders[0]?.sort,
    order: sortOrders[0]?.order,
  } as ManuscriptAuthorQuery);
  const manuscriptAuthorQuery =
    trpc.manuscript.listForAuthor.useQuery(queryOptions);

  return (
    <DashboardAuthorLayout>
      <p className="text-xl font-medium">Submission List</p>
      <ListLayout
        queryResult={manuscriptAuthorQuery}
        allowedSorts={MANUSCRIPT_AUTHOR_SORTS}
        setQueryOptions={setQueryOptions}
        create={
          <Link href="/dashboard/author/submissions/create">
            <a className="btn btn-info btn-sm text-white">New Submission</a>
          </Link>
        }
        main={
          (manuscriptAuthorQuery.data?.manuscripts.length ?? 0) <= 0 ? (
            <p>You have no submissions</p>
          ) : (
            manuscriptAuthorQuery.data?.manuscripts.map((submission) => (
              <Link
                key={submission.id}
                href={`/dashboard/author/submissions/${submission.id}`}
              >
                <a className="flex flex-row items-center rounded-xl border p-4 shadow-lg transition-all duration-100 hover:bg-gray-100">
                  <div className="flex flex-1 flex-col items-start gap-1">
                    <p className="font-bold">{submission.title}</p>
                    <p className="text-gray-400">
                      Submitted : {parseDate(submission.createdAt)}
                    </p>
                    <p className="text-gray-400">
                      Last Updated :{" "}
                      {parseDate(submission.latestHistory!.history.updatedAt)}
                    </p>
                    <KeywordBadges keywords={submission.keywords} />
                  </div>
                  <div className="divider divider-horizontal" />
                  <div className="flex w-36 justify-center">
                    <StatusBadge
                      history={submission.latestHistory!.history}
                      role="author"
                    />
                  </div>
                </a>
              </Link>
            ))
          )
        }
      />
    </DashboardAuthorLayout>
  );
};

export default DashboardAuthorSubmissionsPage;
