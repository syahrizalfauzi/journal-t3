// noinspection JSUnusedGlobalSymbols

import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {NextPage} from "next/types";
import {useEffect} from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {roleMap} from "../../utils/role";

const DashboardPage: NextPage = () => {
    const session = useSession();
    const router = useRouter();
    const handleLogOut = () => signOut({callbackUrl: "/auth/login"});

    useEffect(() => {
        (async () => {
            if (session.status === "loading") return;

            if (session.status === "unauthenticated" || !session.data) {
                await handleLogOut();
                return;
            }
            const roleNumber = session.data.user.role;

            if (roleNumber > 0) {
                const role = roleMap[roleNumber];
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

                await router.push(`/dashboard/${firstRole[0]}`);
            } else {
                await router.push("/dashboard/settings");
            }
        })()

    }, [router, session]);

    return <DashboardLayout/>;
};

export default DashboardPage;
