// src/layouts/PageLayout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Reusable Page Layout
 * - Adds Header and Footer automatically
 * - Provides a sticky footer layout
 * - Allows per-page SEO (title + meta description)
 */
const PageLayout = ({
  children,
  className = "",
  title = "Herts & Essex Host Families",
  description = "Providing quality homestay experiences for international students across Hertfordshire and Essex."
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic SEO tags */}
      <Helmet>
        <title>
          {title}
        </title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Global Header */}
      <Header />

      {/* Main content area (flex-grow keeps footer pushed to bottom) */}
      <main className={`flex-grow ${className}`}>
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default PageLayout;
