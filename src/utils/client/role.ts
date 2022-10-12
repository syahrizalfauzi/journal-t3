import Role from "../../types/Role";

export const roleMap: Role[] = [
  { admin: false, chief: false, reviewer: false, author: false },
  { admin: false, chief: false, reviewer: false, author: true },
  { admin: false, chief: false, reviewer: true, author: false },
  { admin: false, chief: false, reviewer: true, author: true },
  { admin: false, chief: true, reviewer: false, author: false },
  { admin: false, chief: true, reviewer: false, author: true },
  { admin: false, chief: true, reviewer: true, author: false },
  { admin: false, chief: true, reviewer: true, author: true },
  { admin: true, chief: false, reviewer: false, author: false },
  { admin: true, chief: false, reviewer: false, author: true },
  { admin: true, chief: false, reviewer: true, author: false },
  { admin: true, chief: false, reviewer: true, author: true },
  { admin: true, chief: true, reviewer: false, author: false },
  { admin: true, chief: true, reviewer: false, author: true },
  { admin: true, chief: true, reviewer: true, author: false },
  { admin: true, chief: true, reviewer: true, author: true },
];

const roleTexts = roleMap.map((e) => JSON.stringify(e));

export const getRoleNumber = (role: Role) =>
  roleTexts.indexOf(JSON.stringify(role));
export const getHasRole = (
  roleNumber: number,
  role: "author" | "reviewer" | "chief" | "admin"
) => (roleMap[roleNumber] ?? roleMap[0])?.[role];
