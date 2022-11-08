import { SORT_LABEL } from "../constants/sorts";
import { SortOrder, Sorts } from "../types/SortOrder";

const getSortOrder = <T extends Sorts>(
  allowedSorts: readonly T[],
  descFirst = true
): SortOrder<T>[] => {
  return allowedSorts
    .map<SortOrder<T>[]>((allowedSort) => {
      const sorts: SortOrder<T>[] = [
        {
          sort: allowedSort,
          order: "desc",
          label: `${SORT_LABEL[allowedSort]} (DESC)`,
        },
        {
          sort: allowedSort,
          order: "asc",
          label: `${SORT_LABEL[allowedSort]} (ASC)`,
        },
      ];

      return descFirst ? sorts : sorts.reverse();
    })
    .reduce((a, b) => [...a, ...b], []);
};

export default getSortOrder;
