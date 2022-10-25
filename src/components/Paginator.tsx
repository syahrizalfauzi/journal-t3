import React from "react";
import { PaginationMetadata } from "../utils/getItemIndex";

type PaginatorProps = {
  metadata: PaginationMetadata;
  onChangePage: (newPage: number) => unknown;
};

export const Paginator = ({ metadata, onChangePage }: PaginatorProps) => {
  const handleFirstPage = () => onChangePage(1);
  const handlePreviousPage = () => onChangePage(metadata.page - 1);
  const handleNextPage = () => onChangePage(metadata.page + 1);
  const handleLastPage = () => onChangePage(metadata.pageCount);

  return (
    <div className="flex flex-col items-end gap-4 self-end">
      <p>
        Showing items 1-
        {Math.min(
          metadata.totalCount,
          metadata.page * metadata.perPage
        )} of {metadata.totalCount}
      </p>
      <div className="btn-group">
        {metadata.page > 1 && (
          <>
            <button className="btn btn-outline" onClick={handleFirstPage}>
              «
            </button>
            <button
              className="btn btn-outline border-x-0"
              onClick={handlePreviousPage}
            >
              {metadata.page - 1}
            </button>
          </>
        )}

        <button className="btn btn-active">{metadata.page}</button>
        {metadata.page < metadata.pageCount && (
          <>
            <button
              className="btn btn-outline border-x-0"
              onClick={handleNextPage}
            >
              {metadata.page + 1}
            </button>
            <button className="btn btn-outline " onClick={handleLastPage}>
              »
            </button>
          </>
        )}
      </div>
    </div>
  );
};
