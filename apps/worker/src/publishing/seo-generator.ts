import type { SeoMetadata } from "@yashuverse/contracts";
import type { PortfolioDocument } from "@yashuverse/portfolio-schema";

export class SeoGenerator {
  public generateSeoMetadata(
    portfolio: PortfolioDocument,
    baseUrl = "https://yashwanthreddyg-portfolio.web.app"
  ): SeoMetadata {
    const profile = portfolio.profile;
    const title = `YASHUVERSE — ${profile.name} | ${profile.tagline}`;
    const description = `${profile.name} — ${profile.summary.substring(0, 160)}`;
    const canonicalUrl = baseUrl;

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      dateCreated: portfolio.publishedAt,
      dateModified: portfolio.publishedAt,
      mainEntity: {
        "@type": "Person",
        name: profile.name,
        alternateName: "YASHUVERSE",
        jobTitle: profile.tagline,
        description: profile.summary,
        url: canonicalUrl,
        sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
        knowsAbout: [
          "Autonomous AI Agents",
          "Machine Learning Systems",
          "pgvector",
          "Full-Stack Architecture",
          "TypeScript",
          "Python",
          "React",
        ],
      },
    };

    return {
      title,
      description,
      canonicalUrl,
      ogType: "profile",
      ogImage: `${baseUrl}/og-image.png`,
      twitterCard: "summary_large_image",
      keywords: [
        profile.name,
        "YASHUVERSE",
        "Autonomous AI Agent",
        "Machine Learning Engineer",
        "Full-Stack Architect",
        "Bengaluru",
      ],
      jsonLd,
    };
  }

  public generateSitemapXml(baseUrl = "https://yashwanthreddyg-portfolio.web.app"): string {
    const today = new Date().toISOString().split("T")[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/portfolio</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/workspace</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }

  public generateRobotsTxt(baseUrl = "https://yashwanthreddyg-portfolio.web.app"): string {
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  }
}

export const defaultSeoGenerator = new SeoGenerator();
