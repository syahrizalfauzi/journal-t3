import {
  INVITATION_LIST_SORTS,
  MANUSCRIPT_AUTHOR_SORTS,
  MANUSCRIPT_CHIEF_SORTS,
  QUESTION_LIST_SORTS,
  USER_LIST_SORTS,
  USER_REVIEWER_SORTS,
} from "../constants/sorts";
import { z } from "zod";
import { Sorts } from "../types/SortOrder";
import { Filter } from "../types/Filter";
import {
  MANUSCRIPT_AUTHOR_FILTERS,
  MANUSCRIPT_CHIEF_FILTERS,
  MANUSCRIPT_REVIEWER_FILTERS,
} from "../constants/filters";

export const paginationInput = z.object({
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().optional(),
});
const generateSortInput = <T extends readonly Sorts[]>(allowedSorts: T) => {
  const [sort1, ...sorts] = allowedSorts as readonly T[number][];

  return z.object({
    sort: z.enum([sort1!, ...sorts]),
  });
};
const generateFilterInput = <T extends readonly Filter[]>(filters: T) => {
  const [key1, ...keys] = filters.map(({ key }) => key) as T[number]["key"][];
  const [value1, ...values] = filters
    .map(({ availableValues }) => availableValues.map(({ value }) => value))
    .reduce(
      (a, b) => [...a, ...b],
      []
    ) as T[number]["availableValues"][number]["value"][];

  return z.object({
    filter: z
      .object({
        key: z.enum([key1!, ...keys]),
        value: z.enum([value1!, ...values]),
      })
      .optional(),
  });
};

export const userListQuery = paginationInput.merge(
  generateSortInput(USER_LIST_SORTS)
);
export const userReviewerQuery = paginationInput.merge(
  generateSortInput(USER_REVIEWER_SORTS)
);
export const questionListQuery = paginationInput.merge(
  generateSortInput(QUESTION_LIST_SORTS)
);
export const manuscriptAuthorQuery = paginationInput
  .merge(generateSortInput(MANUSCRIPT_AUTHOR_SORTS))
  .merge(generateFilterInput(MANUSCRIPT_AUTHOR_FILTERS));

export const manuscriptReviewerQuery = paginationInput.merge(
  generateFilterInput(MANUSCRIPT_REVIEWER_FILTERS)
);
export const manuscriptChiefQuery = paginationInput
  .merge(generateSortInput(MANUSCRIPT_CHIEF_SORTS))
  .merge(generateFilterInput(MANUSCRIPT_CHIEF_FILTERS));
export const invitationListQuery = paginationInput.merge(
  generateSortInput(INVITATION_LIST_SORTS)
);
