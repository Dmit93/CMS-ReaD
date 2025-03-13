import React from "react";
import { Helmet } from "react-helmet";
import MediaLibrary from "@/components/media/MediaLibrary";
import DashboardLayout from "@/components/layout/DashboardLayout";

const MediaPage = () => {
  return (
    <>
      <Helmet>
        <title>Media Library - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <MediaLibrary />
      </DashboardLayout>
    </>
  );
};

export default MediaPage;
