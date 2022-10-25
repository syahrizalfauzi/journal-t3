import React from "react";
import type { NextPage } from "next/types";
import { DashboardAdminLayout } from "../../../../components/layout/dashboard/DashboardAdminLayout";
import { InputLabel } from "../../../../components/InputLabel";
import { Checkboxes } from "../../../../components/Checkboxes";
import { SelectOptions } from "../../../../components/SelectOptions";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../../utils/trpc";
import { getRoleNumber } from "../../../../utils/role";
import moment from "moment/moment";
import { z } from "zod";
import { newUserValidator } from "../../../../server/validators/user";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";

type CreateUserForm = Omit<z.infer<typeof newUserValidator>, "role"> & {
  isReviewer: boolean;
  isAuthor: boolean;
  isChief: boolean;
  isAdmin: boolean;
};

const DashboardAdminUserCreatePage: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<CreateUserForm>();
  const { mutate, isLoading } = trpc.user.create.useMutation({
    onSettled: toastSettleHandler,
  });

  const onSubmit: SubmitHandler<CreateUserForm> = (data) => {
    const role = getRoleNumber({
      isAdmin: data.isAdmin,
      isChief: data.isChief,
      isReviewer: data.isReviewer,
      isAuthor: data.isAuthor,
    });

    mutate(
      {
        ...data,
        role,
        profile: {
          ...data.profile,
          gender: Number(data.profile.gender),
          birthdate: moment(data.profile.birthdate).toDate(),
        },
      },
      { onSuccess: () => reset() }
    );
  };

  return (
    <DashboardAdminLayout>
      <p className="text-xl font-medium">Create User</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-lg font-medium">Account</p>
        <InputLabel label="Username *">
          <input
            {...register("username")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Username"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Password *">
          <input
            {...register("password")}
            disabled={isLoading}
            required
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
          />
        </InputLabel>
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
            {
              id: "isChief",
              label: "Chief Editor",
              rest: register("isChief"),
            },
            {
              id: "isAdmin",
              label: "Admin",
              rest: register("isAdmin"),
            },
          ]}
        >
          <span className="label-text">Role</span>
        </Checkboxes>
        <p>Profile</p>
        <InputLabel label="Name *">
          <input
            {...register("profile.name")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Full Name"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Birthdate">
          <input
            {...register("profile.birthdate")}
            disabled={isLoading}
            type="date"
            placeholder="Birthdate"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Degree">
          <input
            {...register("profile.degree")}
            disabled={isLoading}
            type="text"
            placeholder="Ph. D., M.D., etc."
            className="input input-bordered w-full"
          />
        </InputLabel>
        <label className="label justify-start gap-4" htmlFor="gender">
          <span className="label-text">Gender</span>
          <select
            {...register("profile.gender")}
            disabled={isLoading}
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
            disabled={isLoading}
            required
            placeholder="Address"
            className="textarea textarea-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Country *">
          <input
            {...register("profile.country")}
            disabled={isLoading}
            required
            type="text"
            placeholder="Country"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Email *">
          <input
            {...register("profile.email")}
            disabled={isLoading}
            required
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Phone *">
          <input
            {...register("profile.phone")}
            disabled={isLoading}
            required
            type="tel"
            placeholder="Phone Number"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Phone (Secondary)">
          <input
            {...register("profile.phoneWork")}
            disabled={isLoading}
            type="tel"
            placeholder="Secondary Phone Number"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <p>Institution</p>
        <InputLabel label="Institution">
          <input
            {...register("profile.institution")}
            disabled={isLoading}
            type="text"
            placeholder="Institution"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Position">
          <input
            {...register("profile.position")}
            disabled={isLoading}
            type="text"
            placeholder="Position"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Department">
          <input
            {...register("profile.department")}
            disabled={isLoading}
            type="text"
            placeholder="Institution"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Institution Address">
          <textarea
            {...register("profile.addressWork")}
            disabled={isLoading}
            placeholder="Institution Address"
            className="textarea textarea-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Expertise * (at least 1)">
          <input
            {...register("profile.expertise")}
            disabled={isLoading}
            type="text"
            placeholder="Expertise (comma-separated)"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <InputLabel label="Personal Keywords">
          <input
            {...register("profile.keywords")}
            disabled={isLoading}
            type="text"
            placeholder="Personal Keywords (comma-separated)"
            className="input input-bordered w-full"
          />
        </InputLabel>
        <p>* Required fields</p>
        <input
          disabled={isLoading}
          type="submit"
          value="Create User"
          className="btn"
        />
      </form>
    </DashboardAdminLayout>
  );
};

export default DashboardAdminUserCreatePage;
