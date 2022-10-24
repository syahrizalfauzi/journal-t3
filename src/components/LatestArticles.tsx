import { CellPlugin } from "@react-page/editor";
import Link from "next/link";
import React from "react";
import LayoutProps from "../types/LayoutProps";
import { parseDateDay } from "../utils/parseDate";

type LatestArticlesProps = LayoutProps;

const LatestArticles = ({ children }: LatestArticlesProps) => {
  return (
    <section className="py-16">
      <div className="flex flex-row items-center">
        <div className="prose max-w-none flex-1">{children}</div>
        <div className="not-prose">
          <Link href="/archive">
            <a className="not-prose btn self-end text-white">See More</a>
          </Link>
        </div>
      </div>
      <div className="not-prose mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl">
          <p className="text-lg font-medium">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt
            fugiat consequuntur molestias voluptatibus ipsam ut itaque debitis.
            Facilis, alias repudiandae dolore asperiores tenetur commodi
            obcaecati debitis doloremque esse consectetur fuga.
          </p>
          <p className="italic">Author 1, Author 2</p>
          <p className="text-gray-400">Available {parseDateDay(new Date())}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl">
          <p className="text-lg font-medium">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt
            fugiat consequuntur molestias voluptatibus ipsam ut itaque debitis.
            Facilis, alias repudiandae dolore asperiores tenetur commodi
            obcaecati debitis doloremque esse consectetur fuga.
          </p>
          <p className="italic">Author 1, Author 2</p>
          <p className="text-gray-400">Available {parseDateDay(new Date())}</p>
        </div>
      </div>
    </section>
  );
};

export const latestArticlesPlugin: CellPlugin<LatestArticlesProps> = {
  Renderer: ({ children }) => <LatestArticles>{children}</LatestArticles>,
  id: "latestArticlesPlugin",
  title: "Latest Articles",
  version: 1,
};

export default LatestArticles;
