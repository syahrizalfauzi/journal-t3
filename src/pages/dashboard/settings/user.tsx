import React, { useEffect } from "react";
import { z } from "zod";
import { updateUserValidator } from "../../../server/validators/user";
import { trpc } from "../../../utils/trpc";
import { toastSettleHandler } from "../../../utils/toastSettleHandler";
import { SubmitHandler, useForm } from "react-hook-form";
import moment from "moment";
import DashboardSettingsLayout from "../../../components/layout/dashboard/DashboardSettingsLayout";
import InputLabel from "../../../components/InputLabel";
import SelectOptions from "../../../components/SelectOptions";
import DetailLayout from "../../../components/layout/dashboard/DetailLayout";

type EditUserForm = Omit<z.infer<typeof updateUserValidator>, "role">;

const DashboardSettingsUserPage = () => {
  const {
    data: user,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.auth.user.useQuery();

  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.user.update.useMutation({
      onSettled: toastSettleHandler,
    });

  const { register, handleSubmit, reset } = useForm<EditUserForm>();

  const onSubmit: SubmitHandler<EditUserForm> = (data) => {
    if (!user) return;

    mutationUpdate({
      ...data,
      role: Number(user.role),
      profile: {
        ...data.profile,
        gender: Number(data.profile.gender),
        birthdate: moment(data.profile.birthdate).toDate(),
      },
    });
  };

  useEffect(() => {
    if (!user) return;

    reset({
      ...user,
      profile: {
        ...user.profile,
        expertise: user.profile?.expertise.join(", "),
        keywords: user.profile?.keywords.join(", "),
      },
    });
  }, [user]);

  return (
    <DashboardSettingsLayout>
      <DetailLayout
        isLoading={queryLoading}
        data={user}
        errorMessage={queryError?.message}
        render={(_) => (
          <>
            <p className="text-xl font-medium">Edit User</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <p className="text-lg font-medium">Account</p>
              <InputLabel label="Username *">
                <input
                  {...register("username")}
                  disabled={mutationLoading}
                  required
                  type="text"
                  placeholder="Username"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <p>Profile</p>
              <InputLabel label="Name *">
                <input
                  {...register("profile.name")}
                  disabled={mutationLoading}
                  required
                  type="text"
                  placeholder="Full Name"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Birthdate">
                <input
                  {...register("profile.birthdate")}
                  disabled={mutationLoading}
                  type="date"
                  placeholder="Birthdate"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Degree">
                <input
                  {...register("profile.degree")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Ph. D., M.D., etc."
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <label className="label justify-start gap-4" htmlFor="gender">
                <span className="label-text">Gender</span>
                <select
                  {...register("profile.gender")}
                  disabled={mutationLoading}
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
                  disabled={mutationLoading}
                  required
                  placeholder="Address"
                  className="textarea textarea-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Country *">
                <input
                  {...register("profile.country")}
                  disabled={mutationLoading}
                  required
                  type="text"
                  placeholder="Country"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Email *">
                <input
                  {...register("profile.email")}
                  disabled={mutationLoading}
                  required
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Phone *">
                <input
                  {...register("profile.phone")}
                  disabled={mutationLoading}
                  required
                  type="tel"
                  placeholder="Phone Number"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Phone (Secondary)">
                <input
                  {...register("profile.phoneWork")}
                  disabled={mutationLoading}
                  type="tel"
                  placeholder="Secondary Phone Number"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <p>Institution</p>
              <InputLabel label="Institution">
                <input
                  {...register("profile.institution")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Institution"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Position">
                <input
                  {...register("profile.position")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Position"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Department">
                <input
                  {...register("profile.department")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Institution"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Institution Address">
                <textarea
                  {...register("profile.addressWork")}
                  disabled={mutationLoading}
                  placeholder="Institution Address"
                  className="textarea textarea-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Expertise * (at least 1)">
                <input
                  {...register("profile.expertise")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Expertise (comma-separated)"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Personal Keywords">
                <input
                  {...register("profile.keywords")}
                  disabled={mutationLoading}
                  type="text"
                  placeholder="Personal Keywords (comma-separated)"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <p>* Required fields</p>
              <input
                disabled={mutationLoading}
                type="submit"
                value="Update Account & Profile"
                className="btn"
              />
            </form>
          </>
        )}
      />
    </DashboardSettingsLayout>
  );
};

export default DashboardSettingsUserPage;
