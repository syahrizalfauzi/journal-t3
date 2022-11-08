import { CellPlugin } from "@react-page/editor";

type ContainerData = {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export const containerPlugin: CellPlugin<ContainerData> = {
  Renderer: ({ children, data }) => (
    <div
      className="container my-auto"
      style={{
        paddingTop: data.paddingTop,
        paddingBottom: data.paddingBottom,
        paddingLeft: data.paddingLeft,
        paddingRight: data.paddingRight,
      }}
    >
      {children}
    </div>
  ),
  id: "containerPlugin",
  title: "Container",
  version: 1,
  controls: {
    type: "autoform",
    schema: {
      type: "object",
      properties: {
        paddingTop: {
          type: "number",
          title: "Padding Top",
          default: 0,
        },
        paddingBottom: {
          type: "number",
          title: "Padding Bottom",
          default: 0,
        },
        paddingLeft: {
          type: "number",
          title: "Padding Left",
          default: 16,
        },
        paddingRight: {
          type: "number",
          title: "Padding Right",
          default: 16,
        },
      },
    },
  },
};
