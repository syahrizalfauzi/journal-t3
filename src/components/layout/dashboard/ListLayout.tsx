import React from "react";
import ErrorTexts from "../../ErrorTexts";

type ListLayoutProps = {
  main: React.ReactNode;
  error?: string;
  isLoading?: boolean;
  sort?: React.ReactNode;
  filter?: React.ReactNode;
  create?: React.ReactNode;
};

const ListLayout = ({
  sort,
  filter,
  create,
  main,
  error,
  isLoading,
}: ListLayoutProps) => {
  return (
    <div className="flex flex-col items-stretch gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {sort}
          {filter}
          {/* {#if sortOrders.length > 0}
				<select bind:value={sortOrder} className="select select-bordered max-w-xs">
					{#each sortOrders as sortOrder}
						<option value={sortOrder}>{sortOrder.label}</option>
					{/each}
				</select>
			{/if}
			{#if filters.length > 0}
				<select bind:value={filterString} className="select select-bordered max-w-xs">
					<option value={undefined} selected>No Filter</option>
					{#each filters as filter}
						<option disabled>{filter.label}</option>
						{#each filter.availableValues as filterValue}
							<option value={`${filter.key}=${filterValue.value}`}>{filterValue.label}</option>
						{/each}
					{/each}
				</select>
			{/if} */}
        </div>
        {!isLoading && !error && create}
        {/* {#if !isLoading && !errorMessage && currentData}
			<slot name="create" />
		{/if} */}
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <ErrorTexts>{error}</ErrorTexts>}
      {!isLoading && !error && main}
      {/* {#if isLoading}
		<p>Loading...</p>
	{/if}
	{#if errorMessage}
		<ErrorTexts>{errorMessage}</ErrorTexts>
	{/if}
	{#if !isLoading && !errorMessage && currentData && paginated}
		{#if currentData.data.length > 0}
			<div className="flex flex-col gap-4 pb-4 overflow-x-auto">
				<slot name="data" metadata={currentData._metadata} />
			</div>
			<Paginator
				paginationMetadata={currentData._metadata}
				handleFirstPage={() => (page = 1)}
				handlePreviousPage={() => (page = getPreviousPage(page, currentData))}
				handleNextPage={() => (page = getNextPage(page, currentData))}
				handleLastPage={() => (page = getLastPage(page, currentData))}
			/>
		{:else}
			<p>No {dataName}</p>
		{/if}
	{/if} */}
    </div>
  );
};

export default ListLayout;
