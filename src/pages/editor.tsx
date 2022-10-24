/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import RootLayout from "../components/layout/RootLayout";

import Editor, { CellPlugin, CellPluginList } from "@react-page/editor";
import type { Value } from "@react-page/editor";
import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import divider from "@react-page/plugins-divider";
import background from "@react-page/plugins-background";
import { latestArticlesPlugin } from "../components/LatestArticles";
import { TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import classNames from "classnames";
import { FaImage } from "react-icons/fa";

const containerPlugin: CellPlugin = {
  Renderer: ({ children }) => (
    <div className="container my-auto">{children}</div>
  ),
  id: "containerPlugin",
  title: "Container",
  version: 1,
};
const horizontalDividerPlugin: CellPlugin = {
  Renderer: () => <div className="divider divider-vertical w-full" />,
  id: "horizontalDividerPlugin",
  title: "Horizontal Divider",
  version: 1,
  icon: <p>---</p>,
};
const verticalDividerPlugin: CellPlugin = {
  Renderer: () => <div className="divider divider-horizontal h-full" />,
  id: "verticalDividerPlugin",
  title: "Vertical Divider",
  version: 1,
  icon: <p>|</p>,
};

type ImageState = {
  src: string;
  alt?: string | undefined;
  height: number;
  width: number;
  position: "center" | "left" | "right";
};

const myImagePlugin: CellPlugin<ImageState> = {
  id: "myImagePlugin",
  title: "Image",
  icon: <FaImage />,
  version: 1,
  Renderer: ({ data }) => (
    <>
      <img
        src={data.src}
        alt={data.alt}
        style={{
          height: data.height,
          width: data.width,
        }}
        className={classNames({
          "mx-auto": data.position === "center",
          "ml-auto": data.position === "right",
          "mr-auto": data.position === "left",
        })}
      />
    </>
  ),
  createInitialData: () => ({
    height: 256,
    width: 256,
    position: "center",
    src: "http://localhost:3000/sample.jpeg",
    alt: "Sample image",
  }),
  controls: {
    type: "custom",
    Component: ({ data, onChange }) => {
      return (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            type="text"
            value={data.src}
            label="Image link"
            placeholder="asdasd"
            fullWidth
            onChange={(e) => onChange({ src: e.target.value })}
          />
          <TextField
            type="text"
            value={data.alt}
            label="Image title"
            fullWidth
            onChange={(e) => onChange({ alt: e.target.value })}
          />
          <TextField
            type="number"
            value={data.height}
            label="Height (px)"
            fullWidth
            onChange={(e) => onChange({ height: Number(e.target.value) })}
          />
          <TextField
            type="number"
            value={data.width}
            label="Width (px)"
            fullWidth
            onChange={(e) => onChange({ width: Number(e.target.value) })}
          />
          <TextField
            select
            className="col-span-2"
            label="Position"
            value={data.position}
            onChange={(e) =>
              onChange({
                position: e.target.value as "center" | "left" | "right",
              })
            }
          >
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </TextField>
        </div>
      );
    },
  },
  //     type: "autoform",
  //     schema: {
  //       properties: {
  //         src: {
  //           type: "string",
  //           default: "http://localhost:3000/sample.jpeg",
  //           title: "Image link",
  //         },
  //         alt: { type: "string", default: "Sample image", title: "Image title" },
  //         height: { type: "integer", default: 256, title: "Height (px)" },
  //         width: { type: "integer", default: 256, title: "Width (px)" },
  //         isRight: {
  //           type: "boolean",
  //           uniforms: {
  //             showIf: (data) => !data.isCenter,
  //           },
  //         },
  //         isCenter: {
  //           type: "boolean",
  //         },
  //       },
  //     },
  //   },
};

const cellPlugins: CellPluginList = [
  slate(),
  spacer,
  background({}),
  myImagePlugin,
  horizontalDividerPlugin,
  verticalDividerPlugin,
  latestArticlesPlugin,
  containerPlugin,
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
