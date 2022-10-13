export interface Role extends Record<string, boolean> {
  admin: boolean;
  chief: boolean;
  reviewer: boolean;
  author: boolean;
}

export type AvailableRoles = "author" | "reviewer" | "chief" | "admin";
