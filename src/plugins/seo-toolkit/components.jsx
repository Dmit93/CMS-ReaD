import React, { useState, useEffect } from "react";

// Constants
const SEO_PLUGIN_ID = "seo-toolkit";

/**
 * Analyze content for SEO issues
 */
function analyzeSEO(content, seoData) {
  const issues = [];
  let score = 100;

  // Check title length
  if (!seoData.meta_title) {
    issues.push({ type: "error", message: "Meta title is missing" });
    score -= 15;
  } else if (seoData.meta_title.length < 30) {
    issues.push({
      type: "warning",
      message: "Meta title is too short (less than 30 characters)",
    });
    score -= 5;
  } else if (seoData.meta_title.length > 60) {
    issues.push({
      type: "warning",
      message: "Meta title is too long (more than 60 characters)",
    });
    score -= 5;
  }

  // Check description
  if (!seoData.meta_description) {
    issues.push({ type: "error", message: "Meta description is missing" });
    score -= 15;
  } else if (seoData.meta_description.length < 70) {
    issues.push({
      type: "warning",
      message: "Meta description is too short (less than 70 characters)",
    });
    score -= 5;
  } else if (seoData.meta_description.length > 160) {
    issues.push({
      type: "warning",
      message: "Meta description is too long (more than 160 characters)",
    });
    score -= 5;
  }

  // Check keywords
  if (!seoData.meta_keywords) {
    issues.push({
      type: "info",
      message: "Meta keywords are missing (not critical for SEO)",
    });
  }

  // Check content length
  const contentText = content.content
    ? content.content.replace(/<[^>]*>/g, "")
    : "";
  const wordCount = contentText.split(/\s+/).filter(Boolean).length;

  if (wordCount < 300) {
    issues.push({
      type: "warning",
      message: "Content is too short (less than 300 words)",
    });
    score -= 10;
  }

  // Check if title appears in content
  if (seoData.meta_title && contentText) {
    if (!contentText.toLowerCase().includes(seoData.meta_title.toLowerCase())) {
      issues.push({
        type: "info",
        message: "Meta title does not appear in content",
      });
      score -= 3;
    }
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues,
    wordCount,
  };
}

/**
 * SEO Metadata Panel Component
 */
export function SEOMetadataPanel({ content, onChange }) {
  const [seoData, setSeoData] = useState(
    content.seo || generateDefaultSEOMetadata(content),
  );
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    // Analyze SEO when content or seoData changes
    const result = analyzeSEO(content, seoData);
    setAnalysis(result);

    // Update content with SEO data
    onChange({ ...content, seo: seoData });
  }, [content, seoData]);

  const handleChange = (key, value) => {
    setSeoData({ ...seoData, [key]: value });
  };

  return (
    <div className="seo-metadata-panel p-4">
      <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>

      {analysis && (
        <div className="seo-score mb-4">
          <div className="flex items-center justify-between">
            <span>SEO Score:</span>
            <span
              className={`font-bold ${analysis.score >= 70 ? "text-green-600" : analysis.score >= 50 ? "text-yellow-600" : "text-red-600"}`}
            >
              {analysis.score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className={`h-2.5 rounded-full ${analysis.score >= 70 ? "bg-green-600" : analysis.score >= 50 ? "bg-yellow-600" : "bg-red-600"}`}
              style={{ width: `${analysis.score}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={seoData.meta_title || ""}
            onChange={(e) => handleChange("meta_title", e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            {seoData.meta_title ? seoData.meta_title.length : 0}/60 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Meta Description
          </label>
          <textarea
            className="w-full p-2 border rounded"
            rows="3"
            value={seoData.meta_description || ""}
            onChange={(e) => handleChange("meta_description", e.target.value)}
          ></textarea>
          <div className="text-xs text-gray-500 mt-1">
            {seoData.meta_description ? seoData.meta_description.length : 0}/160
            characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Meta Keywords
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={seoData.meta_keywords || ""}
            onChange={(e) => handleChange("meta_keywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Canonical URL
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={seoData.canonical_url || ""}
            onChange={(e) => handleChange("canonical_url", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Robots</label>
          <select
            className="w-full p-2 border rounded"
            value={seoData.robots || "index,follow"}
            onChange={(e) => handleChange("robots", e.target.value)}
          >
            <option value="index,follow">Index, Follow</option>
            <option value="index,nofollow">Index, No Follow</option>
            <option value="noindex,follow">No Index, Follow</option>
            <option value="noindex,nofollow">No Index, No Follow</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Social Media Preview</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">OG Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={seoData.og_title || ""}
              onChange={(e) => handleChange("og_title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              OG Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows="2"
              value={seoData.og_description || ""}
              onChange={(e) => handleChange("og_description", e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              OG Image URL
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={seoData.og_image || ""}
              onChange={(e) => handleChange("og_image", e.target.value)}
            />
          </div>
        </div>
      </div>

      {analysis && analysis.issues.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">SEO Issues</h4>
          <ul className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <li
                key={index}
                className={`text-sm p-2 rounded ${issue.type === "error" ? "bg-red-50 text-red-700" : issue.type === "warning" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * SEO Settings Panel Component
 */
export function SEOSettingsPanel() {
  const [settings, setSettings] = useState({
    default_title_format: "{title} | {site_name}",
    default_description_length: 160,
    enable_social_meta: true,
    enable_schema_markup: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Get current project ID (in a real app, this would come from context or environment)
      const projectId = "default";

      // In a real implementation, this would save to the database
      console.log("Saving SEO settings:", settings);

      // Simulate successful save
      setTimeout(() => {
        setSaveMessage({
          type: "success",
          text: "Settings saved successfully",
        });
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      setSaveMessage({ type: "error", text: `Error: ${error.message}` });
      setIsSaving(false);
    }
  };

  return (
    <div className="seo-settings-panel p-4">
      <h3 className="text-xl font-semibold mb-4">SEO Toolkit Settings</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Default Title Format
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={settings.default_title_format}
            onChange={(e) =>
              handleChange("default_title_format", e.target.value)
            }
          />
          <div className="text-xs text-gray-500 mt-1">
            Available variables: {"{title}"}, {"{site_name}"}, {"{separator}"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Default Description Length
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={settings.default_description_length}
            onChange={(e) =>
              handleChange(
                "default_description_length",
                parseInt(e.target.value, 10),
              )
            }
            min="50"
            max="300"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enable_social_meta"
            className="mr-2"
            checked={settings.enable_social_meta}
            onChange={(e) =>
              handleChange("enable_social_meta", e.target.checked)
            }
          />
          <label htmlFor="enable_social_meta" className="text-sm font-medium">
            Enable Social Media Metadata
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enable_schema_markup"
            className="mr-2"
            checked={settings.enable_schema_markup}
            onChange={(e) =>
              handleChange("enable_schema_markup", e.target.checked)
            }
          />
          <label htmlFor="enable_schema_markup" className="text-sm font-medium">
            Enable Schema Markup
          </label>
        </div>

        {saveMessage && (
          <div
            className={`p-3 rounded ${saveMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {saveMessage.text}
          </div>
        )}

        <div>
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate default SEO metadata
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
