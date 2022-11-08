//Removed Sorts[] so that it's a literal type

export const SORT_LABEL = {
  createdAt: "Date Created",
  updatedAt: "Last Updated",
  username: "Username",
  role: "Role",
  isActivated: "Activated",
  email: "Email",
  name: "Name",
  country: "Country",
  maxScale: "Max Scale",
  question: "Question",
  title: "Title",
  status: "Status",
  url: "URL",
  doi: "DOI",
  isAvailable: "Available",
} as const;

export const USER_LIST_SORTS = [
  "createdAt",
  "username",
  "role",
  "isActivated",
  "email",
  "name",
  "country",
] as const;

export const USER_REVIEWER_SORTS = [
  "name",
  "username",
  "email",
  "country",
] as const;

export const QUESTION_LIST_SORTS = [
  "createdAt",
  "maxScale",
  "question",
] as const;

export const MANUSCRIPT_AUTHOR_SORTS = [
  "updatedAt",
  "createdAt",
  "title",
] as const;

export const MANUSCRIPT_CHIEF_SORTS = [
  "updatedAt",
  "createdAt",
  "title",
  "status",
] as const;

export const INVITATION_LIST_SORTS = [
  "updatedAt",
  "createdAt",
  "status",
] as const;

export const PAGE_LIST_SORTS = [
  "name",
  "createdAt",
  "updatedAt",
  "url",
] as const;

export const EDITION_LIST_SORTS = [
  "updatedAt",
  "name",
  "doi",
  "isAvailable",
  "createdAt",
] as const;
