import React from "react";
import RootLayout from "../components/layout/RootLayout";

const AnnouncementsPage = () => {
  return (
    <RootLayout>
      <div className="container my-8">
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
      </div>
    </RootLayout>
  );
};

export default AnnouncementsPage;
