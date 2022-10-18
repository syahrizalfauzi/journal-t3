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

export interface SortOrder<T extends Sorts> {
  sort: T;
  order: "asc" | "desc";
  label: string;
}
