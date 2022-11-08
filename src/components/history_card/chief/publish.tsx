import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../utils/trpc";
import { HistoryCardAction } from "../../HistoryCardAction";
import { SelectOptions } from "../../SelectOptions";

type PublishForm = {
  editionId: string;
};

type Props = {
  isLoading: boolean;
  onPublish: (editionId: string) => unknown;
};

export const HistoryCardChiefPublish = ({ isLoading, onPublish }: Props) => {
  const { handleSubmit, register } = useForm<PublishForm>();
  const { data } = trpc.edition.listShort.useQuery();

  const onSubmit: SubmitHandler<PublishForm> = ({ editionId }: PublishForm) => {
    const edition = data?.find((edition) => edition.id === editionId);

    if (!edition) return;

    if (
      !confirm(
        `Publish this article to edition ${edition.name}?\n\nDOI : ${edition.doi}`
      )
    )
      return;
    onPublish(editionId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HistoryCardAction isLoading={isLoading}>
        <table className="border-separate border-spacing-y-2 border-spacing-x-4 text-left">
          <tbody>
            <tr>
              <th>Select Edition</th>
              <td>
                {!data ? (
                  "Loading..."
                ) : data.length <= 0 ? (
                  "No edition available, please make a new edition first"
                ) : (
                  <select
                    {...register("editionId")}
                    className="select select-bordered select-sm flex-1"
                  >
                    <SelectOptions
                      selectData={data.map((edition) => ({
                        value: edition.id,
                        label: edition.name,
                      }))}
                    />
                  </select>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </HistoryCardAction>
    </form>
  );
};
