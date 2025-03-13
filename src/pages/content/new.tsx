import React from "react";
import { Helmet } from "react-helmet";
import ContentEditor from "@/components/content/ContentEditor";
import DashboardLayout from "@/components/layout/DashboardLayout";

const NewContentPage = () => {
  return (
    <>
      <Helmet>
        <title>Create New Content - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <ContentEditor />
      </DashboardLayout>
    </>
  );
};

export default NewContentPage;
