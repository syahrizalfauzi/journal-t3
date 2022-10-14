export const getOrderQuery = (
  { sort, order }: { sort?: string; order?: "asc" | "desc" },
  allowedSorts: readonly string[]
) => {
  if (!sort || !allowedSorts.some((v) => v === sort)) return undefined;

  return {
    [sort as string]: order ?? "asc",
  };
};
