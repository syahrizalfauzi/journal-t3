import { PaginationMetadata } from "../../utils/getItemIndex";
import { ITEM_COUNT_PER_PAGE } from "../../constants/numbers";

const getSkipPagination = (pageInput: number) => {
  const page = isNaN(pageInput) ? 1 : Number(pageInput);
  const clampedPage = page <= 1 ? 1 : page;
  return (clampedPage - 1) * ITEM_COUNT_PER_PAGE;
};

export const paginationMetadata = (
  totalCount: number,
  { page }: { page?: number }
) => {
  // const page = pageInput ?? 1;
  const clampedPage = page ?? 1 <= 1 ? 1 : page;

  return {
    _metadata: {
      page: clampedPage,
      perPage: ITEM_COUNT_PER_PAGE,
      pageCount: Math.ceil(totalCount / ITEM_COUNT_PER_PAGE),
      totalCount,
    } as PaginationMetadata,
  };
};

export const paginationQuery = ({ page }: { page?: number }) => ({
  skip: getSkipPagination(page ?? 1),
  take: ITEM_COUNT_PER_PAGE,
});
