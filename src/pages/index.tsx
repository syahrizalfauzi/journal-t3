/* eslint-disable @next/next/no-img-element */
import { RootLayout } from "../components/layout/RootLayout";
import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { PageEditor } from "../components/editor/PageEditor";

type PageProps = {
  pageData: string;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const pageData = (
    await prisma?.page.findUnique({
      where: { name: "home" },
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
      {/* <section className="py-16">
        <div className="mx-auto w-1/2">
          <div className="mb-4 flex flex-row items-center gap-16">
            <div>
              <h1 className="mb-4 text-4xl font-bold">Journal Name</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque
                hic quidem laboriosam nostrum provident esse eaque molestias
                illo accusamus, officiis pariatur vel expedita optio alias,
                consectetur quaerat error rem eveniet! Lorem ipsum dolor sit
                amet consectetur adipisicing elit. Tempora, asperiores maiores!
                Blanditiis dicta temporibus explicabo repellat ipsa quis!
                Tempore quae harum voluptatibus deleniti officia cumque sunt
                enim possimus accusamus optio. Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Molestias esse excepturi inventore
                eaque aspernatur enim quas dolore ipsa unde, reprehenderit
                numquam? Quasi dolores laboriosam magnam. Ex eum necessitatibus
                neque inventore!
              </p>
              <div className="mt-8 flex flex-row gap-4">
                <p className="btn">Submit Your Article</p>
                <p className="btn btn-outline">About</p>
              </div>
            </div>
            <img src="/cover.jpeg" alt="Cover" className="float-right w-64" />
          </div>
        </div>
      </section>
      <section className="bg-slate-600 py-8">
        <div className="container">
          <div className="stats w-full bg-transparent text-white">
            <div className="stat place-items-center">
              <div className="stat-title">Downloads</div>
              <div className="stat-value">31K</div>
              <div className="stat-desc">From January 1st to February 1st</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Users</div>
              <div className="stat-value">4,200</div>
              <div className="stat-desc">↗︎ 40 (2%)</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">New Registers</div>
              <div className="stat-value">1,200</div>
              <div className="stat-desc">↘︎ 90 (14%)</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="container">
          <p className="text-center text-3xl font-semibold">Chief Editor</p>
          <div className="mt-8 flex flex-row items-center justify-center gap-16">
            <div className="avatar">
              <div className="h-48 w-48 rounded-full">
                <img src="/editor.png" alt="chief editor" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-medium">Nama Orang</p>
              <p>Asal Fakultas, Asal Universitas</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer footer-center bg-base-300 p-4 text-base-content">
        <div>
          <p>Asal Fakultas, Asal Universitas</p>
          <p>Jl. Alamat Tempatnya, Kecamatan, Kota, Negara</p>
          <p>Telpon (XXX) XXXXXXX</p>
          <br />
          <p>Email : email@domain.com</p>
          <br />
          <p>Copyright © 2022 - All right reserved by ACME Industries Ltd</p>
        </div>
      </footer> */}
    </RootLayout>
  );
};

export default Home;
