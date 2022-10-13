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
  | "status";

export interface SortOrder {
  sort: Sorts;
  order: "asc" | "desc";
  label: string;
}
