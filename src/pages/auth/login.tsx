import { signIn } from "next-auth/react";
import Link from "next/link";
import { NextPage } from "next/types";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorTexts from "../../components/ErrorTexts";
import InputLabel from "../../components/InputLabel";
import AuthLayout from "../../components/layout/AuthLayout";

type LoginForm = {
  username: string;
  password: string;
};

const LoginPage: NextPage = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailableSendEmail, setIsAvailableSendEmail] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setIsLoading(false);

    setError(result?.error);
    setIsAvailableSendEmail(result?.error === "User is not activated");
  };

  const handleSendEmail = () => {
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <div className="mx-auto grid h-screen max-w-[48rem] items-center">
        <form
          className="card-body shadow-2xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputLabel label="Username">
            <input
              {...register("username")}
              disabled={isLoading}
              type="text"
              placeholder="Username"
              className="input input-bordered w-full"
              required
            />
          </InputLabel>
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
            value="Log in"
            className="btn"
          />
          <ErrorTexts message={error} />
          {isAvailableSendEmail && (
            <>
              <p>
                Your account is not activated yet, click the button below to
                send a verification email
              </p>
              <button
                disabled={isLoading}
                className="btn btn-outline"
                onClick={handleSendEmail}
              >
                Send Email
              </button>
            </>
          )}
          <div className="divider divider-vertical">OR</div>
          <Link href="/auth/register">
            <a className="btn btn-outline">Register</a>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
