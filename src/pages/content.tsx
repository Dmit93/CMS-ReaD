import React from "react";
import { Helmet } from "react-helmet";
import ContentManagement from "@/components/content/ContentManagement";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ContentPage = () => {
  return (
    <>
      <Helmet>
        <title>Content Management - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <ContentManagement />
      </DashboardLayout>
    </>
  );
};

export default ContentPage;
