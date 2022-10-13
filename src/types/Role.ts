export interface Role extends Record<string, boolean> {
  isAdmin: boolean;
  isChief: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
}

export type AvailableRoles = "author" | "reviewer" | "chief" | "admin";
