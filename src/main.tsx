import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CMSProvider } from "./lib/context/CMSContext";
import events from "./lib/events";

// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize database
import { initDatabase } from "./lib/services/init-database";
initDatabase().catch(console.error);

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
