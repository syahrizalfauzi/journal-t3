/* eslint-disable @next/next/no-img-element */
import { RootLayout } from "../components/layout/RootLayout";
import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { PageEditor } from "../components/editor/PageEditor";
import { prisma } from "../server/db/client";
import { PageProps } from "../types/PageProps";

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const pageData = (
    await prisma.page.findUnique({
      where: { url: "" },
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

const Home: NextPage<PageProps> = ({ pageData }) => {
  return (
    <RootLayout>
      <PageEditor readOnly value={JSON.parse(pageData)} />
    </RootLayout>
  );
};

export default Home;
