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
  MANUSCRIPT_CHIEF_AUTHOR_FILTERS,
  MANUSCRIPT_REVIEWER_FILTERS,
} from "../constants/filters";

const generateQueryInput = (
  allowedSorts?: readonly Sorts[],
  filters?: readonly Filter[]
) => {
  return z.object({
    order: z.enum(["asc", "desc"]).optional(),
    page: z.number().optional(),
    sort: z.enum(allowedSorts as readonly [string, ...string[]]),
    filter: z
      .object(
        filters
          ? Object.fromEntries(
              filters.map((filter) => [
                filter.key,
                z
                  .enum(
                    filter.availableValues.map(({ value }) => value) as [
                      string,
                      ...string[]
                    ]
                  )
                  .optional(),
              ])
            )
          : {}
      )
      .optional(),
  });
};

export const userListQuery = generateQueryInput(USER_LIST_SORTS);
export const userReviewerQuery = generateQueryInput(USER_REVIEWER_SORTS);
export const questionListQuery = generateQueryInput(QUESTION_LIST_SORTS);
export const manuscriptAuthorQuery = generateQueryInput(
  MANUSCRIPT_AUTHOR_SORTS,
  MANUSCRIPT_CHIEF_AUTHOR_FILTERS
);
export const manuscriptReviewerQuery = generateQueryInput(
  undefined,
  MANUSCRIPT_REVIEWER_FILTERS
);
export const manuscriptChiefQuery = generateQueryInput(
  MANUSCRIPT_CHIEF_SORTS,
  MANUSCRIPT_CHIEF_AUTHOR_FILTERS
);
export const invitationListQuery = generateQueryInput(INVITATION_LIST_SORTS);
