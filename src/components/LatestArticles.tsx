import { CellPlugin } from "@react-page/editor";
import Link from "next/link";
import React from "react";
import { parseDateDay } from "../utils/parseDate";

type LatestArticlesProps = {
  title: string;
};

const LatestArticles = ({ title }: LatestArticlesProps) => {
  return (
    <section className="not-prose py-16">
      <div className="container">
        <div className="flex flex-row justify-between">
          <p className="text-3xl font-bold text-white">{title}</p>
          <Link href="/archive">
            <a className="btn btn-outline border-white text-white">See More</a>
          </Link>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl">
            <p className="text-lg font-medium">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt
              fugiat consequuntur molestias voluptatibus ipsam ut itaque
              debitis. Facilis, alias repudiandae dolore asperiores tenetur
              commodi obcaecati debitis doloremque esse consectetur fuga.
            </p>
            <p className="italic">Author 1, Author 2</p>
            <p className="text-gray-400">
              Available {parseDateDay(new Date())}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl">
            <p className="text-lg font-medium">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt
              fugiat consequuntur molestias voluptatibus ipsam ut itaque
              debitis. Facilis, alias repudiandae dolore asperiores tenetur
              commodi obcaecati debitis doloremque esse consectetur fuga.
            </p>
            <p className="italic">Author 1, Author 2</p>
            <p className="text-gray-400">
              Available {parseDateDay(new Date())}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const latestArticlesPlugin: CellPlugin<LatestArticlesProps> = {
  Renderer: ({ data }) => <LatestArticles {...data} />,
  id: "latestArticlesPlugin",
  title: "Latest Articles",
  description: "asasdasd",
  version: 1,

  //   controls: {
  //     type: "autoform",
  //     schema: {
  //       properties: {
  //         title: {
  //           type: "string",
  //         },
  //       },
  //       required: ["title"],
  //     },
  //   },
};

export default LatestArticles;
