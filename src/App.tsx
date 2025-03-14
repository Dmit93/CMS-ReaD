import React, { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

// Lazy load page components
const MarketplacePage = lazy(() => import("./pages/marketplace"));
const PluginDetailPage = lazy(() => import("./pages/plugin/[id]"));
const PluginsPage = lazy(() => import("./pages/settings/plugins"));
const UsersPage = lazy(() => import("./pages/users"));
const MediaPage = lazy(() => import("./pages/media"));
const ContentPage = lazy(() => import("./pages/content"));
const GeneralSettingsPage = lazy(() => import("./pages/settings/general"));
const PluginSystemPage = lazy(() => import("./pages/settings/plugin-system"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/plugin/:id" element={<PluginDetailPage />} />
          <Route path="/settings/plugins" element={<PluginsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route
            path="/settings/plugin-system"
            element={<PluginSystemPage />}
          />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
