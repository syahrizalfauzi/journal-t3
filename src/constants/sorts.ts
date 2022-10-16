import { Sorts } from "../types/SortOrder";

export const USER_LIST_SORTS: readonly Sorts[] = [
  "createdAt",
  "username",
  "role",
  "isActivated",
  "email",
  "name",
  "country",
] as const;

export const USER_REVIEWER_SORTS: readonly Sorts[] = [
  "username",
  "email",
  "country",
];

export const QUESTION_LIST_SORTS: readonly Sorts[] = [
  "createdAt",
  "maxScale",
  "question",
] as const;

export const MANUSCRIPT_AUTHOR_SORTS: readonly Sorts[] = [
  "updatedAt",
  "createdAt",
  "title",
];

export const MANUSCRIPT_CHIEF_SORTS: readonly Sorts[] = [
  "updatedAt",
  "createdAt",
  "title",
  "status",
];

export const INVITATION_LIST_SORTS: readonly Sorts[] = [
  "updatedAt",
  "createdAt",
  "status",
];

// export const userSortOrdersreadonly : Sorts[] = ([
//   "createdAt",
//   "username",
//   "role",
//   "isActivated",
//   "email",
//   "name",
//   "country",
// ]);

// export const userChiefSortOrdersreadonly : Sorts[] = ([
//   "username",
//   "email",
//   "country",
// ]);
