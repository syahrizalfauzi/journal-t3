import moment from "moment";
import Link from "next/link";
import { NextPage } from "next/types";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import Checkboxes from "../../components/Checkboxes";
import ErrorTexts from "../../components/ErrorTexts";
import InputLabel from "../../components/InputLabel";
import AuthLayout from "../../components/layout/AuthLayout";
import SelectOptions from "../../components/SelectOptions";
import SuccessTexts from "../../components/SuccessTexts";
import { newUserValidators } from "../../server/validators/user";
import { getRoleNumber } from "../../utils/role";
import { trpc } from "../../utils/trpc";

type RegisterForm = Omit<z.infer<typeof newUserValidators>, "role"> & {
  isReviewer: boolean;
  isAuthor: boolean;
};

const RegisterPage: NextPage = () => {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const registerMutation = trpc.auth.register.useMutation();

  const onSubmit: SubmitHandler<RegisterForm> = (data) => {
    const role = getRoleNumber({
      isAdmin: false,
      isChief: false,
      isReviewer: data.isReviewer,
      isAuthor: data.isAuthor,
    });

    registerMutation.mutate({
      ...data,
      role,
      profile: {
        ...data.profile,
        gender: Number(data.profile.gender),
        birthdate: moment(data.profile.birthdate).toDate(),
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mx-auto grid h-screen max-w-[64rem] items-center">
        <form
          className="card-body shadow-2xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-2 flex flex-col gap-4 ">
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-1 flex-col gap-4">
                <p className="flex-grow-0">Account</p>
                <InputLabel label="Username *">
                  <input
                    {...register("username")}
                    disabled={registerMutation.isLoading}
                    required
                    type="text"
                    placeholder="Username"
                    className="input input-bordered w-full"
                  />
                </InputLabel>
                <InputLabel label="Password *">
                  <input
                    {...register("password")}
                    disabled={registerMutation.isLoading}
                    required
                    type="password"
                    placeholder="Password"
                    className="input input-bordered w-full"
                  />
                </InputLabel>
              </div>
              <Checkboxes
                checkboxData={[
                  {
                    id: "isReader",
                    label: "Reader",
                    checked: true,
                    disabled: true,
                  },
                  {
                    id: "isAuthor",
                    label: "Author",
                    rest: register("isAuthor"),
                  },
                  {
                    id: "isReviewer",
                    label: "Reviewer",
                    rest: register("isReviewer"),
                  },
                ]}
              >
                <span className="label-text">Role</span>
              </Checkboxes>
            </div>
            <p>Profile</p>
            <InputLabel label="Name *">
              <input
                {...register("profile.name")}
                disabled={registerMutation.isLoading}
                required
                type="text"
                placeholder="Full Name"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Birthdate">
              <input
                {...register("profile.birthdate")}
                disabled={registerMutation.isLoading}
                type="date"
                placeholder="Birthdate"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Degree">
              <input
                {...register("profile.degree")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Ph. D., M.D., etc."
                className="input input-bordered w-full"
              />
            </InputLabel>
            <label className="label justify-start gap-4" htmlFor="gender">
              <span className="label-text">Gender</span>
              <select
                {...register("profile.gender")}
                disabled={registerMutation.isLoading}
                id="gender"
                className="select select-bordered flex-1"
              >
                <SelectOptions
                  selectData={[
                    { label: "Male", value: "0" },
                    { label: "Female", value: "1" },
                    { label: "Prefer not to say", value: "2" },
                  ]}
                />
              </select>
            </label>
            <InputLabel label="Address *">
              <textarea
                {...register("profile.address")}
                disabled={registerMutation.isLoading}
                required
                placeholder="Address"
                className="textarea textarea-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Country *">
              <input
                {...register("profile.country")}
                disabled={registerMutation.isLoading}
                required
                type="text"
                placeholder="Country"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Email *">
              <input
                {...register("profile.email")}
                disabled={registerMutation.isLoading}
                required
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Phone *">
              <input
                {...register("profile.phone")}
                disabled={registerMutation.isLoading}
                required
                type="tel"
                placeholder="Phone Number"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Phone (Secondary)">
              <input
                {...register("profile.phoneWork")}
                disabled={registerMutation.isLoading}
                type="tel"
                placeholder="Secondary Phone Number"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <p>Institution</p>
            <InputLabel label="Institution">
              <input
                {...register("profile.institution")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Institution"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Position">
              <input
                {...register("profile.position")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Position"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Department">
              <input
                {...register("profile.department")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Institution"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Institution Address">
              <textarea
                {...register("profile.addressWork")}
                disabled={registerMutation.isLoading}
                placeholder="Institution Address"
                className="textarea textarea-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Expertise * (at least 1)">
              <input
                {...register("profile.expertise")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Expertise (comma-separated)"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <InputLabel label="Personal Keywords">
              <input
                {...register("profile.keywords")}
                disabled={registerMutation.isLoading}
                type="text"
                placeholder="Personal Keywords (comma-separated)"
                className="input input-bordered w-full"
              />
            </InputLabel>
            <p>* Required fields</p>
          </div>
          {registerMutation.error && (
            <ErrorTexts>
              {registerMutation.error.data?.zodError ??
                registerMutation.error.message}
            </ErrorTexts>
          )}
          {registerMutation.data && (
            <SuccessTexts>{registerMutation.data.message}</SuccessTexts>
          )}
          <input
            disabled={registerMutation.isLoading}
            type="submit"
            value="Register"
            className="btn"
          />
          <div className="divider divider-vertical">OR</div>
          <Link href="/auth/login">
            <a className="btn btn-outline">Log in</a>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
