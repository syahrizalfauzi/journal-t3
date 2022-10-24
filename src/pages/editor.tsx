import React, { useState } from "react";
import RootLayout from "../components/layout/RootLayout";

import Editor, { CellPlugin, CellPluginList } from "@react-page/editor";
import type { Value } from "@react-page/editor";
import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import divider from "@react-page/plugins-divider";
import { imagePlugin } from "@react-page/plugins-image";
import background from "@react-page/plugins-background";
import { latestArticlesPlugin } from "../components/LatestArticles";
import LayoutProps from "../types/LayoutProps";

const containerPlugin: CellPlugin = {
  Renderer: ({ children }) => <div className="container">{children}</div>,
  id: "containerPlugin",
  title: "Container",
  description: "asasdasd",
  version: 1,

  //   controls: {
  //     type: "autoform",
  //     schema: {
  //       properties: {
  //         title: {
  //           type: "string",
  //         },
  //       },
  //       required: ["title"],
  //     },
  //   },
};

const cellPlugins: CellPluginList = [
  slate(),
  spacer,
  divider,
  imagePlugin({}),
  background({}),
  latestArticlesPlugin,
  containerPlugin,
];
const defaultValue =
  '{"id":"7bepqn","version":1,"rows":[{"id":"jd7h2q","cells":[{"id":"wgdywf","size":12,"plugin":{"id":"latestArticlesPlugin","version":1},"dataI18n":{"default":{}},"isDraftI18n":{"default":false},"rows":[],"inline":null}]},{"id":"swbc4v","cells":[{"id":"f77c93","size":12,"plugin":{"id":"ory/editor/core/layout/background","version":1},"dataI18n":{"default":{"modeFlag":3}},"rows":[{"id":"o3bpm1","cells":[{"id":"lrucsd","size":12,"plugin":{"id":"ory/editor/core/content/slate","version":1},"dataI18n":{"default":{"slate":[{"type":"PARAGRAPH/PARAGRAPH","children":[{"text":"aasdasdaasd"}]}]}},"rows":[],"inline":null}]}],"inline":null}]}]}';

const EditorPage = () => {
  const [value, setValue] = useState<Value | null>(JSON.parse(defaultValue));

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
