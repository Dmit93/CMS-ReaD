import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ContentEditor from "@/components/content/ContentEditor";

const ContentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSave = () => {
    navigate("/content");
  };

  const handleCancel = () => {
    navigate("/content");
  };

  return (
    <>
      <Helmet>
        <title>{id ? "Edit Content" : "New Content"} - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <ContentEditor
          contentId={id}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DashboardLayout>
    </>
  );
};

export default ContentEditPage;
