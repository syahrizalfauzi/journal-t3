// src/pages/_app.tsx
// noinspection JSUnusedGlobalSymbols

import "../styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

const MyApp: AppType = ({ Component, pageProps }: any) => {
  return (
    <SessionProvider session={pageProps.session as Session | null | undefined}>
      <Component {...pageProps} />;
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
