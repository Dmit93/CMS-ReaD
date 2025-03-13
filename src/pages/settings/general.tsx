import React from "react";
import { Helmet } from "react-helmet";
import GeneralSettings from "@/components/settings/GeneralSettings";
import DashboardLayout from "@/components/layout/DashboardLayout";

const GeneralSettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>General Settings - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <GeneralSettings />
      </DashboardLayout>
    </>
  );
};

export default GeneralSettingsPage;
