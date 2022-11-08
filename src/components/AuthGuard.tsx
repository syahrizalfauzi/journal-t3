import LayoutProps from "../types/LayoutProps";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getHasRole, getRoleSelector } from "../utils/role";
import { AvailableRoles } from "../types/Role";

type Props = LayoutProps & {
  allowedRole: AvailableRoles | "loggedIn" | "loggedOut";
  redirectTo?: string;
};

export const AuthGuard = ({ allowedRole, redirectTo, children }: Props) => {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (session.status === "loading") return;

      const hasUser = session.status === "authenticated" && !!session.data;

      // loggedOut, push if hasUser
      // loggedIn, push if !hasUser
      // else, push if !hasUser && !canAccess

      switch (allowedRole) {
        case "loggedOut":
          if (hasUser) {
            await router.push(redirectTo ?? "/auth/login");
            return;
          }
          break;
        case "loggedIn":
          if (!hasUser) {
            await router.push(redirectTo ?? "/auth/login");
            return;
          }
          break;
        default:
          if (!hasUser) {
            await router.push(redirectTo ?? "/auth/login");
            return;
          }
          const canAccess = getHasRole(
            session.data.user.role,
            getRoleSelector(allowedRole)
          );
          if (!canAccess) {
            await router.push(redirectTo ?? "/auth/login");
            return;
          }
      }

      setIsLoading(false);
    })();
  }, [allowedRole, redirectTo, router, session]);

  if (session.status === "loading" || isLoading) return null;

  return <>{children}</>;
};
