// src/pages/_app.tsx
// noinspection JSUnusedGlobalSymbols

import "../styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const MyApp: AppType = ({ Component, pageProps }: any) => {
  return (
    <SessionProvider session={pageProps.session as Session | null | undefined}>
      <Component {...pageProps} />
      <ToastContainer />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
