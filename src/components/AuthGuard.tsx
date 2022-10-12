import LayoutProps from "../types/client/LayoutProps";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getHasRole } from "../utils/client/role";

type AuthGuardProps = LayoutProps & {
  allowedRole:
    | "author"
    | "reviewer"
    | "chief"
    | "admin"
    | "loggedIn"
    | "loggedOut";
  redirectTo: string;
};

const AuthGuard = ({ allowedRole, redirectTo, children }: AuthGuardProps) => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "loading") return;

    const hasUser = session.status === "authenticated";

    if (allowedRole === "loggedOut") {
      if (hasUser) {
        router.push(redirectTo);
        return;
      }
    } else {
      if (!hasUser) {
        router.push(redirectTo);
        return;
      }
      if (allowedRole !== "loggedIn") {
        const canAccess = getHasRole(session.data.user.role, allowedRole);
        if (!canAccess) {
          router.push(redirectTo);
          return;
        }
      }
    }
  }, [allowedRole, redirectTo, router, session]);

  if (session.status === "loading") return null;

  return <>{children}</>;
};

export default AuthGuard;
