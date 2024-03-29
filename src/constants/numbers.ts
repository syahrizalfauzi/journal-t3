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
  unanswered: 0,
  rejected: -1,
  revision: 1,
  accepted: 2,
} as const;

export const ASSESSMENT_DECISION = {
  unanswered: 0,
  rejected: -1,
  majorRevision: 1,
  minorRevision: 2,
  accepted: 3,
} as const;

export const PROOFREAD_DECISION = {
  unanswered: 0,
  noRevision: -1,
  revision: 1,
};

export const ITEM_COUNT_PER_PAGE = 20;
export const DEFAULT_REVIEWERS_COUNT = 4;
export const DEFAULT_MAX_ARTICLES_PER_LATEST_EDITION = 5;
export const MAX_FILE_SIZE = 10000000; //10MB
