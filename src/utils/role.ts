import { Role } from "../types/Role";

export const roleMap: Role[] = [
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
];

const roleTexts = roleMap.map((e) => JSON.stringify(e));

export const getRoleNumber = (role: Role) =>
  roleTexts.indexOf(JSON.stringify(role));
export const getHasRole = (roleNumber: number, role: keyof Role) =>
  (roleMap[roleNumber] ?? roleMap[0])?.[role];
export const getRoleMap = (roleNumber?: number) =>
  roleNumber !== undefined ? roleMap[roleNumber] : undefined;
