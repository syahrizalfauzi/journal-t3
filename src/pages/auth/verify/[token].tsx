import React, { useEffect } from "react";
import { trpc } from "../../../utils/trpc";
import { ensureRouterQuery } from "../../../components/hoc/ensureRouterQuery";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

const VerifyAccountPage = () => {
  const token = useRouter().query.token as string;

  const { mutate, isLoading, data, error } = trpc.auth.verify.useMutation();

  useEffect(() => {
    mutate(token);
  }, [mutate, token]);

  return (
    <div className="container grid h-screen items-center justify-center">
      <Head>
        <title>Verify Account</title>
      </Head>
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">
          {isLoading
            ? "Verifying Account"
            : data
            ? "Account Verified"
            : "Error"}
        </h1>
        {error && <p className="text-red-400">{error.message}</p>}
        {data && (
          <>
            <p>{data}</p>
            <Link href="/auth/login">
              <a className="btn">Login</a>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ensureRouterQuery("token", VerifyAccountPage);
