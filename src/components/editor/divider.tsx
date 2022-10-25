import { CellPlugin } from "@react-page/editor";

export const horizontalDividerPlugin: CellPlugin = {
  Renderer: () => <div className="divider divider-vertical w-full" />,
  id: "horizontalDividerPlugin",
  title: "Horizontal Divider",
  version: 1,
  icon: <p>---</p>,
};
export const verticalDividerPlugin: CellPlugin = {
  Renderer: () => <div className="divider divider-horizontal h-full" />,
  id: "verticalDividerPlugin",
  title: "Vertical Divider",
  version: 1,
  icon: <p>|</p>,
};
