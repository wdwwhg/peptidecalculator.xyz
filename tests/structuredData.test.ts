import { describe, expect, it } from "vitest";
import { buildStructuredData } from "../src/lib/structuredData";

describe("buildStructuredData", () => {
  it("creates WebSite, WebApplication, and breadcrumb entities for a tool page", () => {
    const graph = buildStructuredData({
      title: "Peptide Units Calculator",
      description: "Convert a known peptide dose into volume markings.",
      canonicalUrl: "https://peptidecalculator.xyz/peptide-units-calculator/",
      breadcrumbs: [
        { name: "Home", url: "https://peptidecalculator.xyz/" },
        {
          name: "Peptide Units Calculator",
          url: "https://peptidecalculator.xyz/peptide-units-calculator/"
        }
      ],
      pageType: "tool"
    });

    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"].map((item) => item["@type"])).toEqual([
      "WebSite",
      "WebApplication",
      "BreadcrumbList"
    ]);
  });

  it("adds an Article entity for editorial pages", () => {
    const graph = buildStructuredData({
      title: "How to Use a Peptide Calculator",
      description: "A formula-first guide.",
      canonicalUrl: "https://peptidecalculator.xyz/guides/how-to-use-a-peptide-calculator/",
      breadcrumbs: [
        { name: "Home", url: "https://peptidecalculator.xyz/" },
        {
          name: "How to Use a Peptide Calculator",
          url: "https://peptidecalculator.xyz/guides/how-to-use-a-peptide-calculator/"
        }
      ],
      pageType: "article",
      datePublished: "2026-06-21",
      dateModified: "2026-06-21"
    });

    const article = graph["@graph"].find((item) => item["@type"] === "Article");
    expect(article).toMatchObject({
      headline: "How to Use a Peptide Calculator",
      datePublished: "2026-06-21",
      dateModified: "2026-06-21"
    });
  });
});
