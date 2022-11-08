import { CellPlugin } from "@react-page/editor";
import Link from "next/link";
import { parseDateDay } from "../../utils/parseDate";
import { trpc } from "../../utils/trpc";
import { KeywordBadges } from "../KeywordBadges";

export const latestArticlesPlugin: CellPlugin = {
  Renderer: ({ children }) => {
    const { data, isLoading } = trpc.edition.getLatest.useQuery();

    return (
      <section className="py-16">
        <div className="flex flex-row items-center gap-8">
          <div className="prose max-w-none flex-1">{children}</div>
          <div className="not-prose">
            <Link href="/archive">
              <a className="not-prose btn self-end text-white">See More</a>
            </Link>
          </div>
        </div>
        <div className="not-prose mt-8 flex flex-col gap-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-12 rounded bg-gray-200"></div>
            </div>
          ) : !data ? (
            <p>No latest articles available</p>
          ) : (
            <>
              <p className="text-3xl font-bold">{data.name}</p>
              {data.manuscripts.map(
                ({ authors, id, keywords, latestHistory, title }) => {
                  if (!latestHistory || !latestHistory.history.submission)
                    return null;
                  return (
                    <a
                      key={id}
                      className="pointer pointer flex flex-col gap-1 rounded-xl border bg-white p-4 shadow-xl duration-100 hover:bg-gray-100"
                      href={latestHistory?.history.submission?.fileUrl}
                    >
                      <p className="text-lg font-medium">{title}</p>
                      <p className="italic">{authors}</p>
                      <KeywordBadges keywords={keywords} />
                      {!!latestHistory && (
                        <p className="text-gray-400">
                          Available{" "}
                          {parseDateDay(latestHistory?.history.updatedAt)}
                        </p>
                      )}
                    </a>
                  );
                }
              )}
            </>
          )}
        </div>
      </section>
    );
  },
  id: "latestArticlesPlugin",
  title: "Latest Articles",
  version: 1,
};
