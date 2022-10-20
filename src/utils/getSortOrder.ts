import { SortOrder, Sorts } from "../types/SortOrder";

const parseSortLabel = (sort: Sorts) =>
  ({
    createdAt: "Date Created",
    updatedAt: "Last Updated",
    username: "Username",
    role: "Role",
    isActivated: "Activated",
    email: "Email",
    name: "Name",
    country: "Country",
    maxScale: "Max Scale",
    question: "Question",
    title: "Title",
    status: "Status",
  }[sort]);

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
          label: `${parseSortLabel(allowedSort)} (DESC)`,
        },
        {
          sort: allowedSort as T[number],
          order: "asc",
          label: `${parseSortLabel(allowedSort)} (ASC)`,
        },
      ];

      return descFirst ? sorts : sorts.reverse();
    })
    .reduce((a, b) => [...a, ...b], []);
};

export default getSortOrder;
