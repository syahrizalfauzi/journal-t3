import { NextPage } from "next/types";
import React from "react";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import { trpc } from "../../../../utils/trpc";
import { FaTrashAlt } from "react-icons/fa";
import { parseDate } from "../../../../utils/parseDate";
import Link from "next/link";
import { EDITION_LIST_SORTS } from "../../../../constants/sorts";
import getSortOrder from "../../../../utils/getSortOrder";
import getItemIndex from "../../../../utils/getItemIndex";
import { editionListQuery } from "../../../../server/queries";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { useQueryOptions } from "../../../../utils/useQueryOptions";
import { DashboardChiefLayout } from "../../../../components/layout/dashboard/DashboardChiefLayout";
import { EDITION_LIST_FILTERS } from "../../../../constants/filters";

const sortOrders = getSortOrder(EDITION_LIST_SORTS);
type QueryOptions = typeof editionListQuery;
type Sorts = typeof EDITION_LIST_SORTS[number];
type Filters = typeof EDITION_LIST_FILTERS[number];

const DashboardChiefEditionsPage: NextPage = () => {
  const { queryOptions, ...rest } = useQueryOptions<
    QueryOptions,
    Sorts,
    Filters
  >(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    EDITION_LIST_SORTS,
    EDITION_LIST_FILTERS
  );
  const editionListQuery = trpc.edition.list.useQuery(queryOptions);

  const { mutate: deleteMutate } = trpc.edition.delete.useMutation({
    onSettled: toastSettleHandler,
  });

  const handleDelete = (id: string, edition: string) => {
    if (confirm(`Delete edition '${edition}'?\n\nID : ${id}`))
      deleteMutate(id, { onSuccess: () => editionListQuery.refetch() });
  };
  return (
    <DashboardChiefLayout>
      <p className="text-xl font-medium">Edition List</p>
      <ListLayout
        queryResult={editionListQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        create={
          <Link href="/dashboard/chief/editions/create">
            <a className="btn btn-info btn-sm text-white">New Edition</a>
          </Link>
        }
        main={
          <>
            <table className="table w-full overflow-x-auto">
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>DOI</th>
                  <th>Date Created</th>
                  <th>Last Updated</th>
                  <th>Article Count</th>
                  <th>Available To Public</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(editionListQuery.data?.editions.length ?? 0) <= 0 ? (
                  <p>No journal editions</p>
                ) : (
                  editionListQuery.data?.editions.map((edition, index) => (
                    <tr key={edition.id} className="hover">
                      <th>
                        {getItemIndex(editionListQuery.data._metadata, index)}
                      </th>
                      <td>
                        <Link href={`/dashboard/chief/editions/${edition.id}`}>
                          <a className="link">{edition.name}</a>
                        </Link>
                      </td>
                      <td>{edition.doi}</td>
                      <td>{parseDate(edition.createdAt)}</td>
                      <td>{parseDate(edition.updatedAt)}</td>
                      <td>{edition._count.manuscripts}</td>
                      <td>
                        <input
                          disabled
                          checked={edition.isAvailable}
                          type="checkbox"
                          className="checkbox"
                        />
                      </td>
                      <td>
                        <div
                          onClick={() => handleDelete(edition.id, edition.name)}
                        >
                          <FaTrashAlt
                            className="cursor-pointer"
                            color="red"
                            size="18px"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        }
      />
    </DashboardChiefLayout>
  );
};

export default DashboardChiefEditionsPage;
