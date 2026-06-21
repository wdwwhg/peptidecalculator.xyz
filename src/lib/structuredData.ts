export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface StructuredDataInput {
  title: string;
  description: string;
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];
  pageType: "tool" | "article" | "page";
  datePublished?: string;
  dateModified?: string;
}

type SchemaEntity = Record<string, unknown>;

export interface StructuredDataGraph {
  "@context": "https://schema.org";
  "@graph": SchemaEntity[];
}

const SITE_URL = "https://peptidecalculator.xyz";
const SITE_NAME = "Peptide Calculator";

export function buildStructuredData(input: StructuredDataInput): StructuredDataGraph {
  const graph: SchemaEntity[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description:
        "Independent, free peptide reconstitution and syringe marking calculators.",
      inLanguage: "en"
    }
  ];

  if (input.pageType === "tool") {
    graph.push({
      "@type": "WebApplication",
      "@id": `${input.canonicalUrl}#application`,
      name: input.title,
      url: input.canonicalUrl,
      description: input.description,
      applicationCategory: "HealthApplication",
      browserRequirements: "Requires JavaScript",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${input.canonicalUrl}#breadcrumb`,
    itemListElement: input.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  });

  if (input.pageType === "article") {
    graph.push({
      "@type": "Article",
      "@id": `${input.canonicalUrl}#article`,
      headline: input.title,
      description: input.description,
      mainEntityOfPage: input.canonicalUrl,
      datePublished: input.datePublished,
      dateModified: input.dateModified ?? input.datePublished,
      inLanguage: "en",
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: `${SITE_URL}/about/`
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: `${SITE_URL}/`
      }
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
