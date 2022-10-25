import React, { useEffect, useState } from "react";
import type { NextPage } from "next/types";
import { trpc } from "../../../../utils/trpc";
import { useRouter } from "next/router";
import { DetailLayout } from "../../../../components/layout/dashboard/DetailLayout";
// import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import Editor, { CellPluginList, Value } from "@react-page/editor";
import { containerPlugin } from "../../../../components/editor/container";
import {
  verticalDividerPlugin,
  horizontalDividerPlugin,
} from "../../../../components/editor/divider";
import { latestArticlesPlugin } from "../../../../components/editor/latestArticles";
import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import background from "@react-page/plugins-background";
import { imagePlugin } from "../../../../components/editor/image";
import { RootLayout } from "../../../../components/layout/RootLayout";
import { parseDate } from "../../../../utils/parseDate";

const cellPlugins: CellPluginList = [
  slate(),
  spacer,
  background({}),
  containerPlugin,
  verticalDividerPlugin,
  horizontalDividerPlugin,
  imagePlugin,
  latestArticlesPlugin,
];

const DashboardAdminQuestionEditPage: NextPage = () => {
  const { query } = useRouter();

  if (!query.id) return null;

  const {
    data: page,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.page.get.useQuery(query.id as string);

  // const { mutate: mutationUpdate, isLoading: mutationLoading } =
  //   trpc.page.update.useMutation({
  //     onSettled: toastSettleHandler,
  //   });

  const [editorData, setEditorData] = useState<Value | null>(null);

  useEffect(() => {
    if (!page?.data) return;

    // setEditorData(JSON.parse(page.data));
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

                <button className="btn">Save</button>
              </div>
            </div>
          }
        >
          <div className="max-h-none prose mt-[66px] max-w-none flex-1">
            <Editor
              cellPlugins={cellPlugins}
              value={editorData}
              onChange={setEditorData}
            ></Editor>
          </div>
        </RootLayout>
      )}
    />
  );
};

export default DashboardAdminQuestionEditPage;
