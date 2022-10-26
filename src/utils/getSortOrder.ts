import { SORT_LABEL } from "../constants/sorts";
import { SortOrder, Sorts } from "../types/SortOrder";

const getSortOrder = <T extends readonly Sorts[]>(
  allowedSorts: T,
  descFirst = true
): SortOrder<T[number]>[] => {
  return allowedSorts
    .map<SortOrder<T[number]>[]>((allowedSort) => {
      const sorts: SortOrder<T[number]>[] = [
        {
          sort: allowedSort as T[number],
          order: "desc",
          label: `${SORT_LABEL[allowedSort]} (DESC)`,
        },
        {
          sort: allowedSort as T[number],
          order: "asc",
          label: `${SORT_LABEL[allowedSort]} (ASC)`,
        },
      ];

      return descFirst ? sorts : sorts.reverse();
    })
    .reduce((a, b) => [...a, ...b], []);
};

export default getSortOrder;
