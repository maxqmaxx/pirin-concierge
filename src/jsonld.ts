import { experienceSourceUrl, publicBaseUrl } from "./concierge.js";
import type { Experience } from "./types.js";

export type JsonLdDocument = Record<string, unknown>;

export function experienceJsonLd(experience: Experience, baseUrl?: string): JsonLdDocument {
  const canonicalUrl = experienceSourceUrl(experience, baseUrl);
  const bookingTarget = new URL("/api/v1/booking-requests", publicBaseUrl(baseUrl)).href;

  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": canonicalUrl,
    name: experience.name,
    description: experience.description,
    url: canonicalUrl,
    touristType: experience.category,
    availableLanguage: experience.languages,
    address: {
      "@type": "PostalAddress",
      addressLocality: experience.settlement,
      addressCountry: "BG",
    },
    provider: {
      "@type": "Organization",
      "@id": `${canonicalUrl}#host`,
      name: experience.host.displayName,
    },
    offers: {
      "@type": "Offer",
      price: experience.indicativePrice.amount,
      priceCurrency: experience.indicativePrice.currency,
      description:
        "Indicative price. Every request requires host confirmation; payment is made directly to the host off-platform.",
      seller: {
        "@type": "Organization",
        "@id": `${canonicalUrl}#host`,
        name: experience.host.displayName,
      },
      potentialAction: {
        "@type": "ReserveAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: bookingTarget,
          httpMethod: "POST",
          encodingType: "application/json",
        },
        result: {
          "@type": "Reservation",
          reservationStatus: "https://schema.org/ReservationPending",
        },
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "bookingMode",
        value: "request_only",
      },
      {
        "@type": "PropertyValue",
        name: "syntheticDemoData",
        value: true,
      },
    ],
  };
}

export const toJsonLd = experienceJsonLd;
