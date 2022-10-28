export const parseUrlString = (url: string) =>
  url
    .replace(/\s/g, "")
    .split("/")
    .filter((i) => i !== "")
    .join("/");
