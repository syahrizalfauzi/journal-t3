export interface PaginationMetadata {
  page: number;
  pageCount: number;
  totalCount: number;
  perPage: number;
}

const getItemIndex = (paginationMetadata: PaginationMetadata, index: number) =>
  paginationMetadata.perPage * (paginationMetadata.page - 1) + (index + 1);

export default getItemIndex;
