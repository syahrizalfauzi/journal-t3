import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPage } from "next/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorTexts } from "../../../components/ErrorTexts";
import { ensureRouterQuery } from "../../../components/hoc/ensureRouterQuery";
import { InputLabel } from "../../../components/InputLabel";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { SuccessTexts } from "../../../components/SuccessTexts";
import { trpc } from "../../../utils/trpc";

type ResetPasswordForm = {
  password: string;
};

const ResetPasswordPage: NextPage = () => {
  const token = useRouter().query.token as string;
  const { register, handleSubmit } = useForm<ResetPasswordForm>();
  const { error: tokenError, isLoading: tokenIsLoading } =
    trpc.auth.checkForgotPasswordToken.useQuery(token);
  const {
    mutate,
    data,
    isLoading: resetIsLoading,
    error: resetError,
  } = trpc.auth.resetPassword.useMutation();

  const isLoading = tokenIsLoading || resetIsLoading;

  const onSubmit: SubmitHandler<ResetPasswordForm> = (data) =>
    mutate({ token, password: data.password });

  return (
    <AuthLayout>
      <Head>
        <title>Reset Password</title>
      </Head>
      <div className="mx-auto grid h-screen max-w-[48rem] items-center">
        {tokenIsLoading ? (
          <div className="text-center">Loading...</div>
        ) : tokenError?.message ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold">{tokenError.message}</h1>
            <p className="text-gray-500">
              The token is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth/resetpassword">
              <a className="text-blue-500">Request new token</a>
            </Link>
          </div>
        ) : (
          <form
            className="card-body shadow-2xl"
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputLabel label="Password">
              <input
                {...register("password")}
                disabled={isLoading}
                type="password"
                placeholder="Password"
                className="input input-bordered w-full"
                required
              />
            </InputLabel>
            <input
              disabled={isLoading}
              type="submit"
              value="Reset Password"
              className="btn"
            />
            <ErrorTexts message={resetError?.message} />
            <SuccessTexts message={data} />
            <Link href="/auth/login">
              <a className="btn btn-outline">Login</a>
            </Link>
            <div className="divider divider-vertical">OR</div>
            <Link href="/auth/register">
              <a className="btn btn-outline">Register</a>
            </Link>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ensureRouterQuery("token", ResetPasswordPage);
