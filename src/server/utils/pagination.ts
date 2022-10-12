const ITEM_COUNT_PER_PAGE = 20;

const getSkipPagination = (pageInput: number) => {
  const page = isNaN(pageInput) ? 1 : Number(pageInput);
  const clampedPage = page <= 1 ? 1 : page;
  return (clampedPage - 1) * ITEM_COUNT_PER_PAGE;
};

export const paginationMetadata = (totalCount: number, pageInput?: number) => {
  const page = pageInput ?? 1;
  const clampedPage = page <= 1 ? 1 : page;

  return {
    _metadata: {
      page: clampedPage,
      perPage: ITEM_COUNT_PER_PAGE,
      pageCount: Math.ceil(totalCount / ITEM_COUNT_PER_PAGE),
      totalCount,
    },
  };
};

export const paginationQuery = (pageInput?: number) => ({
  skip: getSkipPagination(pageInput ?? 1),
  take: ITEM_COUNT_PER_PAGE,
});
