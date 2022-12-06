import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
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
      <Head>
        <title>About</title>
      </Head>
      <PageEditor readOnly value={JSON.parse(pageData)} />
    </RootLayout>
  );
};

export default AboutPage;
