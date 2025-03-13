import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CMSProvider } from "./lib/context/CMSContext";
import events from "./lib/events";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Emit CMS lifecycle events
events.emit("cms:beforeRender");

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <CMSProvider>
        <App />
      </CMSProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Emit after render event
events.emit("cms:afterRender");
