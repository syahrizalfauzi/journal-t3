// noinspection JSUnusedGlobalSymbols

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { NextPage } from "next/types";
import { useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ROLE_MAP } from "../../constants/role";

const DashboardPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const handleLogOut = () => signOut({ callbackUrl: "/auth/login" });

  useEffect(() => {
    (async () => {
      if (session.status === "loading") return;

      if (session.status === "unauthenticated" || !session.data) {
        await handleLogOut();
        return;
      }
      const roleNumber = session.data.user.role;

      if (roleNumber > 0) {
        const role = ROLE_MAP[roleNumber];
        if (!role) {
          await handleLogOut();
          return;
        }
        const firstRole = Object.entries(role).find(([, hasAccess]) => {
          if (hasAccess) return true;
        });
        if (!firstRole) {
          await handleLogOut();
          return;
        }

        await router.push(`/dashboard/${firstRole[0].slice(2).toLowerCase()}`);
      } else {
        await router.push("/dashboard/settings");
      }
    })();
  }, [router, session]);

  return <DashboardLayout />;
};

export default DashboardPage;
