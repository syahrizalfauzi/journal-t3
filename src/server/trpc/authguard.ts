import { t } from "./trpc";
import { AvailableRoles } from "../../types/Role";
import { TRPCError } from "@trpc/server";
import { roleMap } from "../../utils/role";

const defaultGuards: AvailableRoles[] = [
  "author",
  "reviewer",
  "chief",
  "admin",
];

//If this is unused, a route can be accessed by non-logged-in user
//If this is used with default params, a route can be accessed by any logged-in user
//If this is used with custom params, a route can be accessed by logged-in user that satisfies the role from param
export const authGuard = (roleGuard: AvailableRoles[] = defaultGuards) =>
  t.middleware(async ({ ctx, next }) => {
    const session = ctx.session;

    if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
    const roles = roleMap[session.user.role];

    if (!roles) throw new TRPCError({ code: "UNAUTHORIZED" });
    const isAllowed =
      roleGuard === defaultGuards
        ? true
        : roleGuard.some(
            (role) => roles[`is${role[0]?.toUpperCase()}${role.slice(1)}`]
          );

    if (!isAllowed) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await next();
  });
