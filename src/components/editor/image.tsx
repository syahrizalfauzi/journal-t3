/* eslint-disable @next/next/no-img-element */
import { CellPlugin } from "@react-page/editor";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import classNames from "classnames";
import { FaImage } from "react-icons/fa";

type ImageState = {
  src: string;
  alt?: string | undefined;
  height: number;
  width: number;
  position: "center" | "left" | "right";
};

export const imagePlugin: CellPlugin<ImageState> = {
  id: "imagePlugin",
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
};
