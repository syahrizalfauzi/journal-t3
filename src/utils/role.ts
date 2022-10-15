import { AvailableRoles, Role } from "../types/Role";
import { AVAILABLE_ROLES, ROLE_MAP, ROLE_TEXTS } from "../constants/role";

export const getRoleNumber = (role: Role) =>
  ROLE_TEXTS.indexOf(JSON.stringify(role));
export const getRoleNumbers = (role: AvailableRoles) => {
  let roleNumbers: number[] = [];

  for (let i = 0; i < Math.pow(2, AVAILABLE_ROLES.length); i++) {
    const parsedRole = ROLE_MAP[i];
    if (!parsedRole) break;
    if (parsedRole[role]) roleNumbers.push(i);
  }

  return roleNumbers;
};
export const getHasRole = (roleNumber: number, role: keyof Role) =>
  (ROLE_MAP[roleNumber] ?? ROLE_MAP[0])?.[role];
export const getRoleMap = (roleNumber?: number) =>
  roleNumber !== undefined ? ROLE_MAP[roleNumber] : undefined;
export const getRoleSelector = (availableRole: AvailableRoles) =>
  `is${availableRole[0]?.toUpperCase()}${availableRole.slice(1)}`;
