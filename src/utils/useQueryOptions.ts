import { useState } from "react";
import { z } from "zod";
import { paginationInput } from "../server/queries";
import { Sorts } from "../types/SortOrder";
import { Filter } from "../types/Filter";

export type QueryType = typeof paginationInput;

type QueryOptions<
  Q extends QueryType,
  S extends Sorts,
  F extends Filter | never
> = z.infer<Q> & {
  sort?: S;
  filter?: {
    key: F["key"];
    value: F["availableValues"][number]["value"];
  };
};

export const useQueryOptions = <
  Q extends QueryType,
  S extends Sorts,
  F extends Filter | never
>(
  defaultValue: QueryOptions<Q, S, F>,
  allowedSorts?: readonly S[],
  allowedFilters?: readonly F[]
) => {
  const [queryOptions, setQueryOptions] =
    useState<QueryOptions<Q, S, F>>(defaultValue);

  const handleChangeSortOrder = (order: "asc" | "desc", sort?: S[number]) => {
    if (!sort) return;

    setQueryOptions((state) => ({
      ...state,
      order,
      sort,
    }));
  };

  const handleChangePage = (page: number) =>
    setQueryOptions((state) => ({ ...state, page }));

  const handleChangeFilter = (
    key: F["key"] | undefined,
    value: F["availableValues"][number]["value"] | undefined
  ) => {
    setQueryOptions((state) => ({
      ...state,
      filter:
        key !== undefined && value !== undefined
          ? {
              key,
              value,
            }
          : undefined,
    }));
  };

  return {
    allowedSorts,
    allowedFilters,
    queryOptions,
    handleChangeSortOrder,
    handleChangePage,
    handleChangeFilter,
  };
};

export type UseQueryOptionsReturn<
  Q extends QueryType,
  S extends Sorts,
  F extends Filter
> = ReturnType<typeof useQueryOptions<Q, S, F>>;
