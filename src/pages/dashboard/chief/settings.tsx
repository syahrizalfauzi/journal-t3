import { NextPage } from "next/types";
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Checkboxes } from "../../../components/Checkboxes";
import { InputLabel } from "../../../components/InputLabel";
import { DashboardChiefLayout } from "../../../components/layout/dashboard/DashboardChiefLayout";
import { DetailLayout } from "../../../components/layout/dashboard/DetailLayout";
import { settingsValidator } from "../../../server/validators/settings";
import { toastSettleHandler } from "../../../utils/toastSettleHandler";
import { trpc } from "../../../utils/trpc";

type EditSettingsForm = z.infer<typeof settingsValidator>;

const DashboardChiefEditionsEditPage: NextPage = () => {
  const {
    data: settings,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.settings.get.useQuery();

  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.settings.update.useMutation({
      onSettled: toastSettleHandler,
    });

  const { register, handleSubmit, reset } = useForm<EditSettingsForm>();

  const onSubmit: SubmitHandler<EditSettingsForm> = ({
    maxArticlesPerLatestEdition,
    reviewersCount,
    maintenanceMode,
  }) => {
    mutationUpdate({
      maxArticlesPerLatestEdition: Number(maxArticlesPerLatestEdition),
      reviewersCount: Number(reviewersCount),
      maintenanceMode,
    });
  };

  useEffect(() => {
    if (!settings) return;

    reset(settings);
  }, [settings, reset]);

  return (
    <DashboardChiefLayout>
      <DetailLayout
        isLoading={queryLoading}
        data={settings}
        errorMessage={queryError?.message}
        render={() => (
          <>
            <p className="text-xl font-medium">Edit Submission Settings</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <InputLabel label="Reviewers Count">
                <input
                  {...register("reviewersCount")}
                  disabled={mutationLoading}
                  required
                  type="number"
                  placeholder="Default : 4"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <InputLabel label="Max. Latest Articles To Display">
                <input
                  {...register("maxArticlesPerLatestEdition")}
                  disabled={mutationLoading}
                  required
                  type="number"
                  placeholder="Default : 5"
                  className="input input-bordered w-full"
                />
              </InputLabel>
              <Checkboxes
                checkboxData={[
                  {
                    id: "maintenanceMode",
                    label: "Maintenance Mode",
                    // checked: settings?.maintenanceMode,
                    rest: register("maintenanceMode"),
                  },
                ]}
              >
                {/* <span className="label-text">Role</span> */}
              </Checkboxes>
              <input
                disabled={mutationLoading}
                type="submit"
                value="Update Settings"
                className="btn"
              />
            </form>
          </>
        )}
      />
    </DashboardChiefLayout>
  );
};

export default DashboardChiefEditionsEditPage;
