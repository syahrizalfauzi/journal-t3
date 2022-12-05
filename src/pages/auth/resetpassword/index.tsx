import Link from "next/link";
import { NextPage } from "next/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { InputLabel } from "../../../components/InputLabel";
import { AuthLayout } from "../../../components/layout/AuthLayout";
import { toastSettleHandler } from "../../../utils/toastSettleHandler";
import { trpc } from "../../../utils/trpc";

type ResetPasswordForm = {
  email: string;
};

const ResetPassword: NextPage = () => {
  const { register, handleSubmit } = useForm<ResetPasswordForm>();
  const { mutate, isLoading } = trpc.auth.sendForgotPasswordEmail.useMutation({
    onSettled: toastSettleHandler,
  });

  const onSubmit: SubmitHandler<ResetPasswordForm> = async ({ email }) =>
    mutate(email);

  return (
    <AuthLayout>
      <div className="mx-auto grid h-screen max-w-[48rem] items-center">
        <form
          className="card-body shadow-2xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p>
            Enter your account&apos;s email address to receive a guide on
            resetting your password.
          </p>
          <InputLabel label="Email">
            <input
              {...register("email")}
              disabled={isLoading}
              type="text"
              placeholder="Email"
              className="input input-bordered w-full"
              required
            />
          </InputLabel>
          <input
            disabled={isLoading}
            type="submit"
            value="Send Email"
            className="btn"
          />
          <Link href="/auth/login">
            <a className="btn btn-outline">Login</a>
          </Link>
          <div className="divider divider-vertical">OR</div>
          <Link href="/auth/register">
            <a className="btn btn-outline">Register</a>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
