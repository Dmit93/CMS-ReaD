/**
 * SEO Toolkit Plugin
 *
 * Provides SEO analysis and metadata management for content
 */

export default {
  metadata: {
    id: "seo-toolkit",
    name: "SEO Toolkit",
    version: "1.0.0",
    description: "Comprehensive SEO tools for optimizing your content",
    author: "CMS Team",
    icon: "Search", // Lucide icon name
    category: "SEO",
    dependencies: [],
  },

  /**
   * Initialize the plugin
   */
  initialize: (api) => {
    console.log("Initializing SEO Toolkit plugin...");

    // Register content editor extension
    api.registerEditorExtension({
      id: "seo-metadata-panel",
      type: "sidebar",
      component: null, // Will be implemented in a JSX file
      pluginId: "seo-toolkit",
    });

    // Register settings panel
    api.registerSettingsPanel({
      id: "seo-settings",
      name: "SEO Settings",
      icon: "Search",
      component: null, // Will be implemented in a JSX file
      order: 50,
      pluginId: "seo-toolkit",
    });

    // Subscribe to content events
    const unsubscribeBeforeCreate = api.events.on(
      "content:beforeCreate",
      (content) => {
        processSEOMetadata(content);
      },
    );

    const unsubscribeBeforeUpdate = api.events.on(
      "content:beforeUpdate",
      (content) => {
        processSEOMetadata(content);
      },
    );

    const unsubscribeAfterGet = api.events.on("content:afterGet", (content) => {
      appendSEOMetadata(content);
    });

    // Return cleanup function
    return () => {
      unsubscribeBeforeCreate();
      unsubscribeBeforeUpdate();
      unsubscribeAfterGet();
    };
  },
};

/**
 * Process SEO metadata before content is saved
 */
async function processSEOMetadata(content) {
  // Extract SEO fields from content if they exist
  if (content.seo && content.id) {
    const seoData = content.seo;
    const contentId = content.id;

    try {
      // In a real implementation, this would save to the database
      console.log("Processing SEO metadata for content:", contentId, seoData);

      // Remove SEO data from content to prevent duplication
      delete content.seo;
    } catch (error) {
      console.error("Failed to process SEO metadata:", error);
    }
  }

  return content;
}

/**
 * Append SEO metadata to content when retrieved
 */
async function appendSEOMetadata(content) {
  if (!content.id) {
    return content;
  }

  try {
    // In a real implementation, this would get metadata from the database
    console.log("Appending SEO metadata to content:", content.id);

    // Generate default metadata
    content.seo = generateDefaultSEOMetadata(content);
  } catch (error) {
    console.error("Failed to append SEO metadata:", error);
  }

  return content;
}

/**
 * Generate default SEO metadata based on content
 */
function generateDefaultSEOMetadata(content) {
  const title = content.title || "";
  let description = "";

  // Extract description from content if available
  if (content.content) {
    const plainText = content.content.replace(/<[^>]*>/g, "");
    description = plainText.substring(0, 160);
    if (plainText.length > 160) {
      description += "...";
    }
  }

  return {
    meta_title: title,
    meta_description: description,
    meta_keywords: "",
    og_title: title,
    og_description: description,
    og_image: "",
    twitter_title: title,
    twitter_description: description,
    twitter_image: "",
    canonical_url: "",
    robots: "index,follow",
  };
}
