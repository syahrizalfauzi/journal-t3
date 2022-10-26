import Editor, { CellPluginList, Value } from "@react-page/editor";
import React from "react";
import { containerPlugin } from "./container";
import { verticalDividerPlugin, horizontalDividerPlugin } from "./divider";
import { imagePlugin } from "./image";
import { latestArticlesPlugin } from "./latestArticles";
import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import background from "@react-page/plugins-background";

type PageEditorProps = {
  value: Value | null;
  onChange?: (v: Value) => void;
  readOnly: boolean;
};

const cellPlugins: CellPluginList = [
  slate((s) => ({ ...s, allowInlineNeighbours: true })),
  spacer,
  background({}),
  containerPlugin,
  verticalDividerPlugin,
  horizontalDividerPlugin,
  imagePlugin,
  latestArticlesPlugin,
];

export const PageEditor = (props: PageEditorProps) => {
  return (
    <div className="prose max-w-none">
      <Editor cellPlugins={cellPlugins} {...props} />
    </div>
  );
};
