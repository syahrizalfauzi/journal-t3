import { Role } from "../types/Role";

export const AVAILABLE_ROLES = [
  "author",
  "reviewer",
  "chief",
  "admin",
] as const;
export const ROLE_MAP: readonly Role[] = [
  { isAdmin: false, isChief: false, isReviewer: false, isAuthor: false },
  { isAdmin: false, isChief: false, isReviewer: false, isAuthor: true },
  { isAdmin: false, isChief: false, isReviewer: true, isAuthor: false },
  { isAdmin: false, isChief: false, isReviewer: true, isAuthor: true },
  { isAdmin: false, isChief: true, isReviewer: false, isAuthor: false },
  { isAdmin: false, isChief: true, isReviewer: false, isAuthor: true },
  { isAdmin: false, isChief: true, isReviewer: true, isAuthor: false },
  { isAdmin: false, isChief: true, isReviewer: true, isAuthor: true },
  { isAdmin: true, isChief: false, isReviewer: false, isAuthor: false },
  { isAdmin: true, isChief: false, isReviewer: false, isAuthor: true },
  { isAdmin: true, isChief: false, isReviewer: true, isAuthor: false },
  { isAdmin: true, isChief: false, isReviewer: true, isAuthor: true },
  { isAdmin: true, isChief: true, isReviewer: false, isAuthor: false },
  { isAdmin: true, isChief: true, isReviewer: false, isAuthor: true },
  { isAdmin: true, isChief: true, isReviewer: true, isAuthor: false },
  { isAdmin: true, isChief: true, isReviewer: true, isAuthor: true },
] as const;

export const ROLE_TEXTS = ROLE_MAP.map((e) => JSON.stringify(e));
