import { SORT_LABEL } from "../constants/sorts";

export type SortOrders = "asc" | "desc";
export type Sorts = keyof typeof SORT_LABEL;

export type SortOrder<T extends Sorts> = {
  sort: T;
  order: SortOrders;
  label: string;
};
