import { describe, expect, it } from "vitest";
import { experiences } from "../src/catalog.js";
import { experienceJsonLd } from "../src/jsonld.js";

interface JsonLdEntity {
  "@id"?: string;
  "@type"?: string;
  [key: string]: unknown;
}

describe("Schema.org JSON-LD", () => {
  it("identifies the synthetic host as both provider and Offer.seller", () => {
    for (const experience of experiences) {
      const document = experienceJsonLd(experience, "https://demo.example");
      const provider = document.provider as JsonLdEntity;
      const offer = document.offers as JsonLdEntity;
      const seller = offer.seller as JsonLdEntity;

      expect(document["@context"]).toBe("https://schema.org");
      expect(offer["@type"]).toBe("Offer");
      expect(provider["@id"]).toBe(seller["@id"]);
      expect(provider.name).toBe(experience.host.displayName);
      expect(seller.name).toBe(experience.host.displayName);
    }
  });

  it("expresses a pending request rather than automatic confirmation", () => {
    const firstExperience = experiences[0];
    if (!firstExperience) {
      throw new Error("The synthetic catalogue unexpectedly has no records.");
    }
    const document = experienceJsonLd(firstExperience, "https://demo.example");
    const offer = document.offers as JsonLdEntity;
    const action = offer.potentialAction as JsonLdEntity;
    const result = action.result as JsonLdEntity;
    const target = action.target as JsonLdEntity;

    expect(result.reservationStatus).toBe("https://schema.org/ReservationPending");
    expect(target.httpMethod).toBe("POST");
    expect(target.urlTemplate).toBe("https://demo.example/api/v1/booking-requests");
    expect(JSON.stringify(document)).toContain("request_only");
    expect(JSON.stringify(document)).toContain("host confirmation");
  });
});
