"use client";

import { useEffect, useState } from "react";

interface SharedContentProps {
  title?: string;
  text?: string;
  url?: string;
}

export default function SharedContent({ title, text, url }: SharedContentProps) {
  const [hasShownAlert, setHasShownAlert] = useState(false);

  useEffect(() => {
    // Log to console when component mounts with shared content
    if (title || text || url) {
      console.log("Shared content received:", {
        title: title || "(none)",
        text: text || "(none)",
        url: url || "(none)",
        timestamp: new Date().toISOString(),
      });

      // Alert the user about the shared URL
      if (url && !hasShownAlert) {
        alert(`Shared URL received: ${url}`);
        setHasShownAlert(true);
      } else if (title && !hasShownAlert) {
        alert(`Shared content received: ${title}`);
        setHasShownAlert(true);
      }
    }
  }, [title, text, url, hasShownAlert]);

  // Don't render anything if there's no shared content
  if (!title && !text && !url) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
        Shared Content
      </h2>
      <div className="space-y-3">
        {url && (
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              URL:
            </p>
            <p className="text-base text-blue-900 dark:text-blue-50 break-all">
              {url}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              Open URL →
            </a>
          </div>
        )}
        {title && (
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Title:
            </p>
            <p className="text-base text-blue-900 dark:text-blue-50">
              {title}
            </p>
          </div>
        )}
        {text && (
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Text:
            </p>
            <p className="text-base text-blue-900 dark:text-blue-50">
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
