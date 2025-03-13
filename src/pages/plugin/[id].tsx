import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import PluginDetails from "../../components/marketplace/PluginDetails";
import InstallationModal from "../../components/marketplace/InstallationModal";

interface PluginData {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  version: string;
  rating: number;
  downloads: number;
  category: string;
  tags: string[];
  price: string;
  screenshots: string[];
  features: string[];
  lastUpdated: string;
  compatibility: string;
  requirements: string[];
}

const PluginDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Mock data for the plugin
  const pluginData: PluginData = {
    id: id || "plugin-123",
    name: "Advanced Content Editor",
    description:
      "A powerful WYSIWYG editor with advanced formatting, media embedding, and collaborative editing features.",
    author: "CMS Solutions",
    authorAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=cms-solutions",
    version: "2.3.1",
    rating: 4.7,
    downloads: 12583,
    category: "Content Editing",
    tags: ["editor", "wysiwyg", "collaboration", "media"],
    price: "Free",
    screenshots: [
      "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=800&q=80",
    ],
    features: [
      "Rich text editing with advanced formatting",
      "Real-time collaborative editing",
      "Media embedding and management",
      "Version history and change tracking",
      "Custom templates and styles",
      "Markdown support",
    ],
    lastUpdated: "2023-05-01",
    compatibility: "CMS Platform v3.0+",
    requirements: ["Media Library Plugin", "User Management System"],
  };

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const handleInstallComplete = (activated: boolean) => {
    setIsInstalled(true);
    // Here you would typically redirect to the plugin management page if activated
    console.log(
      `Plugin installed and ${activated ? "activated" : "not activated"}`,
    );
  };

  const handleBackToMarketplace = () => {
    // Navigate back to marketplace
    window.history.back();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600"
            onClick={handleBackToMarketplace}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Action bar */}
          <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
            <h1 className="text-xl font-semibold">{pluginData.name}</h1>
            <div>
              {isInstalled ? (
                <Button variant="outline" disabled>
                  Installed
                </Button>
              ) : (
                <Button onClick={handleInstallClick}>
                  <Download className="mr-2 h-4 w-4" />
                  Install Plugin
                </Button>
              )}
            </div>
          </div>

          {/* Plugin details */}
          <PluginDetails
            id={pluginData.id}
            name={pluginData.name}
            description={pluginData.description}
            author={pluginData.author}
            authorAvatar={pluginData.authorAvatar}
            version={pluginData.version}
            rating={pluginData.rating}
            downloads={pluginData.downloads}
            category={pluginData.category}
            tags={pluginData.tags}
            price={pluginData.price}
            screenshots={pluginData.screenshots}
            features={pluginData.features}
            lastUpdated={pluginData.lastUpdated}
            compatibility={pluginData.compatibility}
            requirements={pluginData.requirements}
          />
        </div>
      </div>

      {/* Installation modal */}
      <InstallationModal
        isOpen={isInstallModalOpen}
        onOpenChange={setIsInstallModalOpen}
        pluginName={pluginData.name}
        pluginId={pluginData.id}
        onComplete={handleInstallComplete}
      />
    </div>
  );
};

export default PluginDetailPage;
