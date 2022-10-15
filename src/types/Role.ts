import { AVAILABLE_ROLES } from "../constants/role";

export interface Role extends Record<string, boolean> {
  isAdmin: boolean;
  isChief: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
}

export type AvailableRoles = typeof AVAILABLE_ROLES[number];
