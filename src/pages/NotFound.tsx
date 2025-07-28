// src/pages/NotFound.tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from "@/layouts/PageLayout";

/**
 * NotFound Page
 * -------------------------------
 * - Handles 404 errors for invalid routes
 * - Logs the attempted URL for debugging
 * - Provides a link back to the homepage
 * - Uses PageLayout for consistent site header/footer and SEO
 */
const NotFound = () => {
  const location = useLocation();

  // Log the invalid route for debugging purposes
  useEffect(
    () => {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    },
    [location.pathname]
  );

  return (
    <PageLayout
      title="404 - Page Not Found | Herts & Essex Host Families"
      description="The page you are looking for does not exist. Return to the Herts & Essex Host Families homepage."
      className="flex items-center justify-center bg-gray-100 py-20"
    >
      <div className="text-center">
        {/* 404 Heading */}
        <h1 className="text-4xl font-bold mb-4">404</h1>

        {/* Message */}
        <p className="text-xl text-gray-600 mb-4">
          Oops! The page you are looking for does not exist.
        </p>

        {/* Return to Home link */}
        <a
          href="/"
          className="text-blue-500 hover:text-blue-700 underline font-medium"
        >
          Return to Home
        </a>
      </div>
    </PageLayout>
  );
};

export default NotFound;
