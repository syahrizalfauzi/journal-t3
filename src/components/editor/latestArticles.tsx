import { CellPlugin } from "@react-page/editor";
import Link from "next/link";
import { parseDateDay } from "../../utils/parseDate";

export const latestArticlesPlugin: CellPlugin = {
  Renderer: ({ children }) => (
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
  ),
  id: "latestArticlesPlugin",
  title: "Latest Articles",
  version: 1,
};
