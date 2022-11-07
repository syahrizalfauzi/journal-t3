import Editor, { CellPluginList, Value } from "@react-page/editor";
import React from "react";
import { containerPlugin } from "./container";
import { verticalDividerPlugin, horizontalDividerPlugin } from "./divider";
import { imagePlugin } from "./image";
import { latestArticlesPlugin } from "./latestArticles";
import spacer from "@react-page/plugins-spacer";
import background from "@react-page/plugins-background";
import { buttonLinkPlugin } from "./buttonLink";
import { textEditorPlugin } from "./textEditor";

type PageEditorProps = {
  value: Value | null;
  onChange?: (v: Value) => void;
  readOnly: boolean;
};

const cellPlugins: CellPluginList = [
  textEditorPlugin,
  spacer,
  background({}),
  containerPlugin,
  buttonLinkPlugin,
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
