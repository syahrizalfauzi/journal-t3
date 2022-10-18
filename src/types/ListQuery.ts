import { z, ZodEnum, ZodObject } from "zod";

export type ListQuery<
  Q extends ZodObject<{ sort: ZodEnum<[string, ...string[]]> }>,
  S
> = Omit<z.infer<Q>, "sort"> & {
  sort: S;
};
