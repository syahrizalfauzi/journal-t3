import { Sorts } from "../types/SortOrder";

export const userListSorts: readonly Sorts[] = [
  "createdAt",
  "username",
  "role",
  "isActivated",
  "email",
  "name",
  "country",
] as const;

export const questionListSorts: readonly Sorts[] = [
  "createdAt",
  "maxScale",
  "question",
] as const;

// export const userSortOrders: SortOrder[] = getSortOrder([
//   "createdAt",
//   "username",
//   "role",
//   "isActivated",
//   "email",
//   "name",
//   "country",
// ]);

// export const userChiefSortOrders: SortOrder[] = getSortOrder([
//   "username",
//   "email",
//   "country",
// ]);
