/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { RootLayout } from "../components/layout/RootLayout";

import Editor, { CellPluginList } from "@react-page/editor";
import type { Value } from "@react-page/editor";
import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import background from "@react-page/plugins-background";
import { containerPlugin } from "../components/editor/container";
import {
  horizontalDividerPlugin,
  verticalDividerPlugin,
} from "../components/editor/divider";
import { imagePlugin } from "../components/editor/image";
import { latestArticlesPlugin } from "../components/editor/latestArtciles";

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

const EditorPage = () => {
  const [value, setValue] = useState<Value | null>(null);

  const handleChange = (newValue: Value) => {
    console.log("newValue", JSON.stringify(newValue));

    setValue(newValue);
  };

  return (
    <RootLayout>
      <div className="prose max-w-none">
        <Editor
          cellPlugins={cellPlugins}
          value={value}
          onChange={handleChange}
        />
      </div>
    </RootLayout>
  );
};

export default EditorPage;
