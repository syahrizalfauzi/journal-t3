export const getOrderQuery = (
  { sort, order }: { sort?: string; order?: "asc" | "desc" },
  allowedSorts: string[]
) => {
  if (!sort || !allowedSorts.some((v) => v === sort)) return undefined;

  return {
    [sort as string]: order ?? "asc",
  };
};
