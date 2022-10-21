import React from "react";
import RootLayout from "../components/layout/RootLayout";
import { parseDateDay } from "../utils/parseDate";

const ArchivePage = () => {
  return (
    <RootLayout>
      <div className="container my-8">
        <h1 className="text-3xl font-bold">Archive</h1>
        <div className="mt-8 flex flex-col gap-4">
          <p className="ml-4 text-xl">Volume 1 No 1 (2022)</p>
          <div className="pointer pointer flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl duration-100 hover:bg-gray-100">
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
          <div className="pointer pointer flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl duration-100 hover:bg-gray-100">
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
          <div className="divider divider-vertical" />
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <p className="ml-4 text-xl">Volume 1 No 1 (2022)</p>
          <div className="pointer pointer flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl duration-100 hover:bg-gray-100">
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
          <div className="pointer pointer flex flex-col gap-1 rounded-xl bg-white p-4 shadow-xl duration-100 hover:bg-gray-100">
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
          <div className="divider divider-vertical" />
        </div>
      </div>
    </RootLayout>
  );
};

export default ArchivePage;
