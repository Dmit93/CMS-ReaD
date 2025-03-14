import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ContentEditor from "@/components/content/ContentEditor";

const NewContentPage = () => {
  const navigate = useNavigate();

  const handleSave = (contentId: string) => {
    navigate(`/content/edit/${contentId}`);
  };

  const handleCancel = () => {
    navigate("/content");
  };

  return (
    <>
      <Helmet>
        <title>New Content - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <ContentEditor onSave={handleSave} onCancel={handleCancel} />
      </DashboardLayout>
    </>
  );
};

export default NewContentPage;
