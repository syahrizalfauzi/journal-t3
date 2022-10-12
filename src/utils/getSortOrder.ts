import { Sorts, SortOrder } from "../types/SortOrder";

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

const getSortOrder = (
  allowedSorts: readonly Sorts[],
  descFirst = true
): SortOrder[] => {
  return allowedSorts
    .map<SortOrder[]>((allowedSort) => {
      const sorts: SortOrder[] = [
        {
          sort: allowedSort,
          order: "desc",
          label: `${parseSortLabel(allowedSort)} (DESC)`,
        },
        {
          sort: allowedSort,
          order: "asc",
          label: `${parseSortLabel(allowedSort)} (ASC)`,
        },
      ];

      return descFirst ? sorts : sorts.reverse();
    })
    .reduce((a, b) => [...a, ...b]);
};

export default getSortOrder;
