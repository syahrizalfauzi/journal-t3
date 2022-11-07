export type Sorts =
  | "createdAt"
  | "updatedAt"
  | "username"
  | "role"
  | "isActivated"
  | "email"
  | "name"
  | "country"
  | "maxScale"
  | "question"
  | "title"
  | "status"
  | "url"
  | "doi"
  | "isAvailable";

export type SortOrders = "asc" | "desc";

export interface SortOrder<T extends Sorts> {
  sort: T;
  order: SortOrders;
  label: string;
}
