import Link from "next/link";
import { NextPage } from "next/types";
import React from "react";
import ListLayout from "../../components/layout/dashboard/ListLayout";
import { RootLayout } from "../../components/layout/RootLayout";
import { EDITION_LIST_SORTS } from "../../constants/sorts";
import { editionListQuery } from "../../server/queries";
import getSortOrder from "../../utils/getSortOrder";
import { trpc } from "../../utils/trpc";
import { useQueryOptions } from "../../utils/useQueryOptions";

const sortOrders = getSortOrder(EDITION_LIST_SORTS);
type QueryOptions = typeof editionListQuery;
type Sorts = typeof EDITION_LIST_SORTS[number];

const ArchivePage: NextPage = () => {
  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    EDITION_LIST_SORTS
  );
  const editionListQuery = trpc.edition.listArchive.useQuery(queryOptions);

  return (
    <RootLayout>
      <div className="container py-12">
        <h1 className="mb-4 text-3xl font-bold">Journal Edition List</h1>
        <ListLayout
          showSort={false}
          queryResult={editionListQuery}
          useQueryOptionsReturn={{ queryOptions, ...rest }}
          main={editionListQuery.data?.editions.map((edition) => (
            <Link href={`/archive/${edition.id}`} key={edition.id}>
              <a className="flex flex-col items-center justify-between border-b border-gray-200 p-4 transition-all duration-300 hover:bg-gray-300 md:flex-row">
                <div className="flex flex-col items-center md:flex-row">
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">{edition.name}</p>
                    <p className="text-gray-500">{edition.doi}</p>
                  </div>
                </div>
                <p className="text-gray-500">
                  Article count : {edition._count.manuscripts}
                </p>
              </a>
            </Link>
          ))}
        />
      </div>
    </RootLayout>
  );
};

export default ArchivePage;
