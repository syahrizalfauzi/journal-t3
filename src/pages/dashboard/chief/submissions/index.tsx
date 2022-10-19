import React from "react";
import { NextPage } from "next/types";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import getSortOrder from "../../../../utils/getSortOrder";
import { MANUSCRIPT_CHIEF_SORTS } from "../../../../constants/sorts";
import { manuscriptChiefQuery } from "../../../../server/queries";
import { trpc } from "../../../../utils/trpc";
import Link from "next/link";
import parseDate from "../../../../utils/parseDate";
import KeywordBadges from "../../../../components/KeywordBadges";
import StatusBadge from "../../../../components/StatusBadge";
import DashboardChiefLayout from "../../../../components/layout/dashboard/DashboardChiefLayout";
import { useQueryOptions } from "../../../../utils/useQueryOptions";
import { MANUSCRIPT_CHIEF_FILTERS } from "../../../../constants/filters";

const sortOrders = getSortOrder(MANUSCRIPT_CHIEF_SORTS);

type QueryOptions = typeof manuscriptChiefQuery;
type Sorts = typeof MANUSCRIPT_CHIEF_SORTS[number];
type Filters = typeof MANUSCRIPT_CHIEF_FILTERS[number];

const DashboardChiefSubmissionsPage: NextPage = () => {
  const { queryOptions, ...rest } = useQueryOptions<
    QueryOptions,
    Sorts,
    Filters
  >(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    MANUSCRIPT_CHIEF_SORTS,
    MANUSCRIPT_CHIEF_FILTERS
  );
  const manuscriptChiefQuery =
    trpc.manuscript.listForChief.useQuery(queryOptions);

  return (
    <DashboardChiefLayout>
      <p className="text-xl font-medium">Submission List</p>
      <ListLayout
        queryResult={manuscriptChiefQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        main={
          (manuscriptChiefQuery.data?.manuscripts.length ?? 0) <= 0 ? (
            <p>You have no submissions</p>
          ) : (
            manuscriptChiefQuery.data?.manuscripts.map((submission) => (
              <Link
                key={submission.id}
                href={`/dashboard/chief/submissions/${submission.id}`}
              >
                <a className="flex flex-row items-center rounded-xl border p-4 shadow-lg transition-all duration-100 hover:bg-gray-100">
                  <div className="flex flex-1 flex-col items-start gap-1">
                    <p className="font-bold">{submission.title}</p>
                    <p className="font-bold text-gray-400">
                      By : {submission.author.profile!.name}
                    </p>
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
                      role="chief"
                    />
                  </div>
                </a>
              </Link>
            ))
          )
        }
      />
    </DashboardChiefLayout>
  );
};

export default DashboardChiefSubmissionsPage;
