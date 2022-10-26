import { NextPage } from "next/types";
import React from "react";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import { trpc } from "../../../../utils/trpc";
import { parseDate } from "../../../../utils/parseDate";
import Link from "next/link";
import { PAGE_LIST_SORTS } from "../../../../constants/sorts";
import getSortOrder from "../../../../utils/getSortOrder";
import getItemIndex from "../../../../utils/getItemIndex";
import { pageListQuery } from "../../../../server/queries";
import { useQueryOptions } from "../../../../utils/useQueryOptions";
import { DashboardAdminLayout } from "../../../../components/layout/dashboard/DashboardAdminLayout";

const sortOrders = getSortOrder(PAGE_LIST_SORTS);
type QueryOptions = typeof pageListQuery;
type Sorts = typeof PAGE_LIST_SORTS[number];

const DashboardAdminPagesPage: NextPage = () => {
  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    PAGE_LIST_SORTS
  );
  const pageListQuery = trpc.page.list.useQuery(queryOptions);

  return (
    <DashboardAdminLayout>
      <ListLayout
        queryResult={pageListQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        create={
          <Link href="/dashboard/admin/pages/create">
            <a className="btn btn-info btn-sm text-white">New Page</a>
          </Link>
        }
        main={
          <>
            <table className="table w-full overflow-x-auto">
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>URL</th>
                  <th>Date Updated</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {(pageListQuery.data?.pages.length ?? 0) <= 0 ? (
                  <p>No pages</p>
                ) : (
                  pageListQuery.data?.pages.map((page, index) => (
                    <tr key={page.id} className="hover">
                      <th>
                        {getItemIndex(pageListQuery.data._metadata, index)}
                      </th>
                      <td>
                        <Link href={`/dashboard/admin/pages/${page.id}`}>
                          <a className="link">{page.name}</a>
                        </Link>
                      </td>
                      <td>
                        <Link href={page.url}>
                          <a className="link">{page.url}</a>
                        </Link>
                      </td>
                      <td>{parseDate(page.updatedAt)}</td>
                      <td>{parseDate(page.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        }
      />
    </DashboardAdminLayout>
  );
};

export default DashboardAdminPagesPage;
