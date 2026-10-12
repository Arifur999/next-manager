// JSON-LD builders. Pure functions over site.ts, the FAQ data and the public
// plans, so the markup always matches what the page shows. No aggregateRating:
// there are no reviews to rate.
import type { PublicPlan } from "@/zod/publicPlans.validation"

type JsonLd = Record<string, unknown>

const CONTEXT = "https://schema.org"

export const webSiteJsonLd = (site: { name: string; url: string }): JsonLd => ({
  "@context": CONTEXT,
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.name,
  url: site.url,
})

export const softwareApplicationJsonLd = (app: {
  name: string
  url: string
  description: string
  plans: PublicPlan[]
}): JsonLd => ({
  "@context": CONTEXT,
  "@type": "SoftwareApplication",
  "@id": `${app.url}/#software`,
  name: app.name,
  url: app.url,
  description: app.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  ...(app.plans.length > 0 && {
    offers: app.plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.toFixed(2),
      priceCurrency: plan.currency,
      url: `${app.url}/register`,
    })),
  }),
})

// Only emitted once the owner names the publisher (site.publisher).
export const organizationJsonLd = (org: { name: string; url: string }): JsonLd => ({
  "@context": CONTEXT,
  "@type": "Organization",
  "@id": `${org.url}/#organization`,
  name: org.name,
  url: org.url,
})

// Only for Q&A visible on the page, word for word.
export const faqPageJsonLd = (items: ReadonlyArray<{ question: string; answer: string }>): JsonLd => ({
  "@context": CONTEXT,
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
})

export const homeJsonLd = (input: {
  site: { name: string; description: string; publisher: string }
  url: string
  plans: PublicPlan[]
  faq: ReadonlyArray<{ question: string; answer: string }>
}): JsonLd[] => [
  webSiteJsonLd({ name: input.site.name, url: input.url }),
  softwareApplicationJsonLd({ name: input.site.name, url: input.url, description: input.site.description, plans: input.plans }),
  ...(input.site.publisher ? [organizationJsonLd({ name: input.site.publisher, url: input.url })] : []),
  faqPageJsonLd(input.faq),
]
