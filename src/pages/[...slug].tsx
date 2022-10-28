import { GetServerSideProps, NextPage } from "next";
import React from "react";
import { PageEditor } from "../components/editor/PageEditor";
import { RootLayout } from "../components/layout/RootLayout";
import { prisma } from "../server/db/client";
import { PageProps } from "../types/PageProps";

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
}) => {
  if (!query.slug) {
    return {
      notFound: true,
    };
  }
  const pageData = (
    await prisma.page.findUnique({
      where: { url: (query.slug as string[]).join("/") },
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

const OtherPages: NextPage<PageProps> = ({ pageData }) => {
  return (
    <RootLayout>
      <PageEditor readOnly value={JSON.parse(pageData)} />
    </RootLayout>
  );
};

export default OtherPages;
