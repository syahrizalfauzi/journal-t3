import React, { Fragment } from "react";
import { ErrorTexts } from "../../ErrorTexts";
import { Sorts } from "../../../types/SortOrder";
import { Paginator } from "../../Paginator";
import { PaginationMetadata } from "../../../utils/getItemIndex";
import { UseTRPCQueryResult } from "@trpc/react/shared";
import getSortOrder from "../../../utils/getSortOrder";
import { Filter } from "../../../types/Filter";
import {
  QueryType,
  UseQueryOptionsReturn,
} from "../../../utils/useQueryOptions";

type ListLayoutProps<I extends QueryType, S extends Sorts, F extends Filter> = {
  main: React.ReactNode;
  useQueryOptionsReturn: UseQueryOptionsReturn<I, S, F>;
  queryResult: UseTRPCQueryResult<{ _metadata: PaginationMetadata }, any>;
  paginated?: boolean;
  create?: React.ReactNode;
  showSort?: boolean;
};

export const ListLayout = <
  I extends QueryType,
  S extends Sorts,
  F extends Filter
>({
  main,
  queryResult,
  useQueryOptionsReturn,
  paginated = true,
  create,
  showSort = true,
}: ListLayoutProps<I, S, F>) => {
  const {
    allowedSorts,
    allowedFilters,
    handleChangeSortOrder,
    handleChangePage,
    handleChangeFilter,
  } = useQueryOptionsReturn;

  const sortOrders = getSortOrder(allowedSorts ?? []);

  const onChangeSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = sortOrders[Number(e.target.value)];
    if (!sortOrder) return;

    handleChangeSortOrder(sortOrder.order, sortOrder.sort);
  };

  const onChangeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [index, valueIndex] = e.target.value.split("|").map((e) => Number(e));

    if (index === undefined || valueIndex === undefined || !allowedFilters) {
      handleChangeFilter(undefined, undefined);
      return;
    }

    const filterValue = allowedFilters[index]?.availableValues[valueIndex];

    if (!filterValue) return;
    handleChangeFilter(allowedFilters[index]!.key, filterValue.value);
  };
  return (
    <div className="flex flex-col items-stretch gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {showSort && sortOrders.length > 0 && (
            <select
              className="select select-bordered max-w-xs"
              onChange={onChangeSortOrder}
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
          {(allowedFilters?.length ?? 0) > 0 && (
            <select
              className="select select-bordered max-w-xs"
              onChange={onChangeFilter}
            >
              <option value={-1}>No Filter</option>
              {allowedFilters?.map(({ label, availableValues, key }, index) => (
                <Fragment key={key}>
                  <option disabled>{label}</option>
                  {availableValues.map(({ label }, valueIndex) => (
                    <option
                      key={`${index}|${valueIndex}`}
                      value={`${index}|${valueIndex}`}
                    >
                      {label}
                    </option>
                  ))}
                </Fragment>
              ))}
            </select>
          )}
        </div>
        {!queryResult.isLoading && !queryResult.error && create}
      </div>
      {queryResult.isLoading && <p>Loading...</p>}
      {queryResult.error && <ErrorTexts message={queryResult.error.message} />}
      {!queryResult.isLoading && !queryResult.error && main}
      {paginated && queryResult.data?._metadata && (
        <Paginator
          metadata={queryResult.data._metadata}
          onChangePage={handleChangePage}
        />
      )}
    </div>
  );
};

export default ListLayout;
