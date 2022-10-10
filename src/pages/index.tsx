import moment from "moment";
import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";

enum Gender {
  male = 0,
  female = 1,
  other = 2,
}

type RegisterForm = {
  username: string;
  password: string;
  role: number;
  profile: {
    name: string;
    address: string;
    country: string;
    phone: string;
    gender: Gender;
    email: string;
    degree: string;
    phoneWork: string;
    addressWork: string;
    birthdate: string;
    position: string;
    department: string;
    expertise: string;
    keywords: string;
  };
};

const Home: NextPage = () => {
  const authRegister = trpc.auth.register.useMutation();
  const userQuery = trpc.auth.user.useQuery();
  const session = useSession();

  const { register, handleSubmit } = useForm<RegisterForm>({
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

  const onSubmit: SubmitHandler<RegisterForm> = (data) => {
    console.log(data);

    authRegister.mutate({
      ...data,
      role: Number(data.role),
      profile: {
        ...data.profile,
        gender: Number(data.profile),
        birthdate: moment(data.profile.birthdate).toDate(),
      },
    });
  };

  useEffect(() => {
    console.log("data in client from userQuery", userQuery.data);
  }, [userQuery.data]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <Link href="/auth/login">Lojon</Link>
      {session.status === "authenticated" && (
        <button onClick={() => signOut({ redirect: false })}>Logout</button>
      )}
      <p>{JSON.stringify(session)}</p>
      <p>--------------------------------</p>
      {authRegister.isLoading && <p>Loading</p>}
      {authRegister.error?.data?.zodError && (
        <p className="text-red-400">{`${authRegister.error?.data?.zodError}`}</p>
      )}
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
