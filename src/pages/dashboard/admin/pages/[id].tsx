import React, { useEffect, useState } from "react";
import type { NextPage } from "next/types";
import { trpc } from "../../../../utils/trpc";
import { useRouter } from "next/router";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
// import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { Value } from "@react-page/editor";
import { RootLayout } from "../../../../components/layout/RootLayout";
import { parseDate } from "../../../../utils/parseDate";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { PageEditor } from "../../../../components/editor/PageEditor";

const DashboardAdminQuestionEditPage: NextPage = () => {
  const { query, push } = useRouter();

  if (!query.id) return null;

  const {
    data: page,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.page.get.useQuery(query.id as string);

  const { mutate: mutationUpdate, isLoading: mutationLoading } =
    trpc.page.update.useMutation({
      onSettled: toastSettleHandler,
    });

  const [editorData, setEditorData] = useState<Value | null>(null);

  const handleSave = () => {
    mutationUpdate(
      {
        id: query.id as string,
        data: JSON.stringify(editorData),
      },
      {
        onSuccess: () => push("/dashboard/admin/pages"),
      }
    );
  };

  useEffect(() => {
    if (!page?.data) return;

    setEditorData(JSON.parse(page.data));
  }, [page?.data]);

  return (
    <DetailLayout
      isLoading={queryLoading}
      data={page}
      errorMessage={queryError?.message}
      render={(data) => (
        <RootLayout
          subnavbar={
            <div className="z-50 w-full border-t bg-white py-2">
              <div className="container flex w-full flex-row items-center gap-4">
                <p className="flex-1">
                  <span className="font-bold">Editing Page : </span>
                  {data.name}
                </p>
                <p>
                  <span className="font-bold">Last Edit : </span>
                  {parseDate(data.updatedAt)}
                </p>

                <button
                  onClick={handleSave}
                  disabled={mutationLoading}
                  className="btn"
                >
                  {mutationLoading ? "Saving" : "Save"}
                </button>
              </div>
            </div>
          }
        >
          <div className="max-h-none prose mt-[66px] max-w-none flex-1">
            <PageEditor
              value={editorData}
              onChange={setEditorData}
              readOnly={mutationLoading}
            />
          </div>
        </RootLayout>
      )}
    />
  );
};

export default DashboardAdminQuestionEditPage;
