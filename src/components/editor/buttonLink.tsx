import { CellPlugin } from "@react-page/editor";
import classNames from "classnames";

type ButtonLinkData = {
  isSmall: boolean;
  isOutlined: boolean;
  fullWidth: boolean;
  href: string;
  text: string;
};

export const buttonLinkPlugin: CellPlugin<ButtonLinkData> = {
  Renderer: ({ data }) => (
    <a
      className={classNames("btn no-underline", {
        "btn-sm": data.isSmall,
        "btn-outline": data.isOutlined,
        "text-white": !data.isOutlined,
        "w-full": data.fullWidth,
        "w-fit": !data.fullWidth,
      })}
      href={data.href}
    >
      {data.text}
    </a>
  ),
  id: "buttonLinkPlugin",
  title: "Button",
  version: 1,
  controls: {
    type: "autoform",
    schema: {
      type: "object",
      properties: {
        isSmall: {
          type: "boolean",
          title: "Small",
          default: false,
        },
        isOutlined: {
          type: "boolean",
          title: "Outlined",
          default: false,
        },
        fullWidth: {
          type: "boolean",
          title: "Full Width",
          default: false,
        },
        href: {
          type: "string",
          title: "Link",
          default: "",
        },
        text: {
          type: "string",
          title: "Text",
          default: "Button",
        },
      },
    },
  },
};
