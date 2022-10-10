import moment from "moment";
import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { newUserValidators } from "../server/validators/user";
import { trpc } from "../utils/trpc";

type CreateUserForm = z.infer<typeof newUserValidators>;

const Home: NextPage = () => {
  const authRegister = trpc.auth.register.useMutation();
  const session = useSession();

  const { register, handleSubmit } = useForm<CreateUserForm>({
    defaultValues: {
      username: "chief",
      password: "password",
      role: 1,
      profile: {
        name: "Chief",
        address: "Address of Chief",
        country: "Indonesia",
        phone: "089123456789",
        email: "syahrizalfauzi16@gmail.com",
      },
    },
  });

  const onSubmit: SubmitHandler<CreateUserForm> = (data) => {
    console.log(data);

    authRegister.mutate({
      ...data,
      role: Number(data.role),
      profile: {
        ...data.profile,
        gender: Number(data.profile.gender),
        birthdate: moment(data.profile.birthdate).toDate(),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <Link href="/auth/login">Lojon</Link>
      {session.status === "authenticated" && (
        <button onClick={() => signOut({ redirect: false })}>Logout</button>
      )}
      <p>{JSON.stringify(session)}</p>
      <p>--------------------------------</p>
      {authRegister.isLoading && <p>Loading</p>}
      {authRegister.error?.data?.zodError &&
        authRegister.error.data.zodError.map((e, i) => (
          <p key={i} className="text-red-400">
            {e}
          </p>
        ))}
      <p className="text-green-400">{authRegister.data?.message}</p>
      <input
        placeholder="username"
        required
        {...register("username", { required: true })}
      />
      <input
        placeholder="password"
        required
        {...register("password", { required: true })}
        type="password"
      />
      <input
        placeholder="role"
        required
        {...register("role", { required: true })}
      />
      <input
        placeholder="name"
        required
        {...register("profile.name", { required: true })}
      />
      <input
        placeholder="address"
        required
        {...register("profile.address", { required: true })}
      />
      <input
        placeholder="country"
        required
        {...register("profile.country", { required: true })}
      />
      <input
        placeholder="phone"
        required
        {...register("profile.phone", { required: true })}
      />
      <select
        defaultValue={0}
        placeholder="gender"
        {...register("profile.gender")}
      >
        <option value={0}>Male</option>
        <option value={1}>Female</option>
        <option value={2}>Other</option>
      </select>
      <input
        placeholder="email"
        required
        {...register("profile.email", { required: true })}
      />
      <input placeholder="degree" {...register("profile.degree")} />
      <input placeholder="phoneWork" {...register("profile.phoneWork")} />
      <input placeholder="addressWork" {...register("profile.addressWork")} />
      <input
        type="date"
        placeholder="birthdate"
        {...register("profile.birthdate")}
      />
      <input placeholder="position" {...register("profile.position")} />
      <input placeholder="department" {...register("profile.department")} />
      <input placeholder="expertise" {...register("profile.expertise")} />
      <input placeholder="keywords" {...register("profile.keywords")} />
      <input type="submit" value="Submit" />
    </form>
  );
};

export default Home;
