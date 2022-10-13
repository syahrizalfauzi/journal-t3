import React from "react";
import ErrorTexts from "../../ErrorTexts";
import { SortOrder } from "../../../types/SortOrder";
import Paginator from "../../Paginator";
import { PaginationMetadata } from "../../../utils/getItemIndex";
import { UseTRPCQueryResult } from "@trpc/react/shared";

type ListLayoutProps<T> = {
  main: React.ReactNode;
  queryResult: UseTRPCQueryResult<{ _metadata: PaginationMetadata }, any>;
  sortOrders: SortOrder[];
  allowedSorts: readonly T[];
  onChangeSort: (newSort: T, newOrder: "asc" | "desc") => any;
  onChangePage: (newPage: number) => any;
  paginated?: boolean;
  create?: React.ReactNode;
};

const ListLayout = <T extends unknown>({
  main,
  queryResult,
  sortOrders,
  onChangeSort,
  onChangePage,
  paginated = true,
  create,
}: ListLayoutProps<T>) => {
  const handleChangeSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = sortOrders[Number(e.target.value)];
    if (!sortOrder) return;
    onChangeSort(sortOrder.sort as T, sortOrder.order);
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {sortOrders.length > 0 && (
            <select
              className="select select-bordered max-w-xs"
              onChange={handleChangeSortOrder}
            >
              {sortOrders.map((sortOrder, index) => (
                <option
                  key={`${sortOrder.sort}${sortOrder.order}`}
                  value={index}
                >
                  {sortOrder.label}
                </option>
              ))}
            </select>
          )}
          {/*{filter}*/}
          {/*{#if filters.length > 0}*/}
          {/*	<select bind:value={filterString} className="select select-bordered max-w-xs">*/}
          {/*		<option value={undefined} selected>No Filter</option>*/}
          {/*		{#each filters as filter}*/}
          {/*			<option disabled>{filter.label}</option>*/}
          {/*			{#each filter.availableValues as filterValue}*/}
          {/*				<option value={`${filter.key}=${filterValue.value}`}>{filterValue.label}</option>*/}
          {/*			{/each}*/}
          {/*		{/each}*/}
          {/*	</select>*/}
          {/*{/if} */}
        </div>
        {!queryResult.isLoading && !queryResult.error && create}
      </div>
      {queryResult.isLoading && <p>Loading...</p>}
      {queryResult.error && (
        <ErrorTexts>{queryResult.error.message}</ErrorTexts>
      )}
      {!queryResult.isLoading && !queryResult.error && main}
      {paginated && queryResult.data?._metadata && (
        <Paginator
          metadata={queryResult.data._metadata}
          onChangePage={onChangePage}
        />
      )}
    </div>
  );
};

export default ListLayout;
