export const INVITATION_STATUS = {
  unanswered: 0,
  rejected: 1,
  accepted: 2,
} as const;

export const HISTORY_STATUS = {
  rejected: -1,
  submitted: 0,
  inviting: 1,
  reviewing: 2,
  reviewed: 3,
  revision: 4,
  proofread: 5,
  finalized: 6,
  published: 7,
} as const;

export const REVIEW_DECISION = {
  rejected: -1,
  unanswered: 0,
  revision: 1,
  accepted: 2,
} as const;

export const ASSESSMENT_DECISION = {
  rejected: -1,
  unanswered: 0,
  majorRevision: 1,
  minorRevision: 2,
  accepted: 3,
} as const;

export const MAX_TEAM_USERS = 4;
export const ITEM_COUNT_PER_PAGE = 1;
