import { GetServerSideProps, NextPage } from "next";
import React from "react";
import { PageEditor } from "../components/editor/PageEditor";
import { RootLayout } from "../components/layout/RootLayout";
import { prisma } from "../server/db/client";
import { PageProps } from "../types/PageProps";

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const pageData = (
    await prisma.page.findUnique({
      where: { url: "about" },
      select: { data: true },
    })
  )?.data;

  return {
    notFound: !pageData,
    props: {
      pageData: pageData!,
    },
  };
};

const AboutPage: NextPage<PageProps> = ({ pageData }) => {
  return (
    <RootLayout>
      <PageEditor readOnly value={JSON.parse(pageData)} />
      {/* <div className="container my-8">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="my-8">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nulla velit
          ipsa sint natus repudiandae eum, porro iste doloribus explicabo est
          sunt odio perferendis ea odit! Distinctio culpa illum minus officia.
        </p>
        <div className="grid grid-cols-3 gap-16">
          <div className="flex flex-col gap-8">
            <p className="text-xl font-bold">Information</p>
            <ul className="link list-inside list-disc leading-8">
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <p className="text-xl font-bold">Guidelines</p>
            <ul className="link list-inside list-disc leading-8">
              <li>Author guidelines</li>
              <li>Author guidelines</li>
              <li>Author guidelines</li>
              <li>Author guidelines</li>
              <li>Author guidelines</li>
              <li>Author guidelines</li>
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <p className="text-xl font-bold">Others</p>
            <ul className="link list-inside list-disc leading-8">
              <li>Pricing</li>
              <li>Contact information</li>
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
              <li>About this journal</li>
            </ul>
          </div>
        </div>
      </div> */}
    </RootLayout>
  );
};

export default AboutPage;
