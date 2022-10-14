import { ZodError } from "zod";

const zodErrorParser = (error: ZodError) => {
  return error.issues
    .map((e) => {
      const path = e.path[e.path.length - 1]?.toString() ?? "";
      let message = e.message;

      if (e.code === "invalid_type") {
        switch (e.expected) {
          case "array":
            message = "must be an array";
            break;
          case "boolean":
            message = "must either be true or false";
            break;
          default:
            message = `must be a ${e.expected}`;
        }
      } else if (e.code === "invalid_string") {
        switch (e.validation) {
          case "email":
            message = "is not a valid email";
            break;
          case "url":
            message = "must be a URL";
            break;
          default:
            message = `must be a ${e.validation}`;
        }
      } else if (e.code === "too_small") {
        message = `must be at least ${e.minimum} characters`;
      }

      return `${path.charAt(0).toUpperCase()}${path.slice(1)} ${message}`;
    })
    .join(",\n ");
};

export default zodErrorParser;
