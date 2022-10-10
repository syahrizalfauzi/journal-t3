import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type LoginForm = {
  username: string;
  password: string;
};

const LoginPage: NextPage = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [isOk, setIsOk] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    setError(result?.error);
    setIsOk(result?.ok ?? false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isOk && <p>u good!</p>}
      <p>{error}</p>
      <input
        {...register("username", { required: true })}
        placeholder="Username"
      />
      <input
        {...register("password", { required: true })}
        placeholder="Password"
        type="password"
      />
      <input type="submit" value="Log" />
    </form>
  );
};

export default LoginPage;
