import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import cmsCore from "../cms-core";
import events from "../events";

interface CMSContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const CMSContext = createContext<CMSContextType>({
  isInitialized: false,
  isLoading: true,
  error: null,
});

export const useCMS = () => useContext(CMSContext);

interface CMSProviderProps {
  children: ReactNode;
}

export const CMSProvider: React.FC<CMSProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeCMS = async () => {
      try {
        // Initialize the CMS
        await cmsCore.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize CMS:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to CMS events
    const unsubscribeBeforeInit = events.on("cms:beforeInit", () => {
      console.log("CMS is initializing...");
    });

    const unsubscribeAfterInit = events.on("cms:afterInit", () => {
      console.log("CMS initialized successfully");
    });

    // Initialize the CMS
    initializeCMS();

    // Clean up event listeners
    return () => {
      unsubscribeBeforeInit();
      unsubscribeAfterInit();
    };
  }, []);

  const value = {
    isInitialized,
    isLoading,
    error,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};
