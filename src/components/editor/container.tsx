import { CellPlugin } from "@react-page/editor";

export const containerPlugin: CellPlugin = {
  Renderer: ({ children }) => (
    <div className="container my-auto">{children}</div>
  ),
  id: "containerPlugin",
  title: "Container",
  version: 1,
};
