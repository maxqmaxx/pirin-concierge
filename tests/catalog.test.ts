import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Ajv2020, type AnySchema } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { experiences, getExperience, listByArea, searchExperiences } from "../src/catalog.js";

function readJson(relativePath: string): unknown {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), "utf8")) as unknown;
}

function createValidator(): Ajv2020 {
  return new Ajv2020({
    allErrors: true,
    strict: true,
    formats: {
      date: /^\d{4}-\d{2}-\d{2}$/u,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
    },
  });
}

describe("synthetic experience catalogue", () => {
  it("contains exactly 12 schema-valid records, three per settlement", () => {
    const schema = readJson("../schemas/experience.schema.json") as AnySchema;
    const ajv = createValidator();
    const validate = ajv.compile(schema);

    expect(experiences).toHaveLength(12);
    for (const experience of experiences) {
      expect(validate(experience), JSON.stringify(validate.errors)).toBe(true);
    }

    const counts = Object.fromEntries(
      ["Bansko", "Razlog", "Banya", "Dobarsko"].map((settlement) => [
        settlement,
        experiences.filter((experience) => experience.settlement === settlement).length,
      ]),
    );
    expect(counts).toEqual({ Bansko: 3, Razlog: 3, Banya: 3, Dobarsko: 3 });
  });

  it("contains only synthetic, request-only records without contact fields", () => {
    for (const experience of experiences) {
      expect(experience.synthetic).toBe(true);
      expect(experience.host.synthetic).toBe(true);
      expect(experience.bookingMode).toBe("request_only");
      expect(experience.confirmationMode).toBe("host_required");
      expect(experience.paymentMode).toBe("off_platform_direct_to_host");
      expect(experience.availability.mode).toBe("by_request");
      expect(Object.keys(experience.host)).toEqual(["id", "displayName", "synthetic"]);
      expect(JSON.stringify(experience)).not.toMatch(/(?:email|phone|telephone|contact)/iu);
    }
  });

  it("uses unique identifiers and slugs", () => {
    expect(new Set(experiences.map(({ id }) => id)).size).toBe(12);
    expect(new Set(experiences.map(({ slug }) => slug)).size).toBe(12);
  });
});

describe("catalogue discovery", () => {
  it("finds experiences by weighted text and filters", () => {
    expect(searchExperiences("weaving").map(({ id }) => id)).toContain("exp-bansko-loom-patterns");
    expect(searchExperiences({ area: "Banya" })).toHaveLength(3);
    expect(searchExperiences({ category: "heritage" })).toHaveLength(2);
    expect(searchExperiences({ language: "en", limit: 2 })).toHaveLength(2);
  });

  it("gets a record by either id or slug", () => {
    const byId = getExperience("exp-bansko-loom-patterns");
    const bySlug = getExperience("bansko-loom-patterns");
    expect(byId).toBeDefined();
    expect(bySlug).toEqual(byId);
    expect(getExperience("missing-experience")).toBeUndefined();
  });

  it("lists the three records for an area case-insensitively", () => {
    expect(listByArea("bansko")).toHaveLength(3);
    expect(listByArea("DOBARSKO")).toHaveLength(3);
    expect(listByArea(" ")).toEqual([]);
  });
});

describe("booking-request JSON Schema", () => {
  const schema = readJson("../schemas/booking-request.schema.json") as AnySchema;
  const ajv = createValidator();
  const validate = ajv.compile(schema);

  it("accepts a fully synthetic example.com request", () => {
    expect(
      validate({
        experienceId: "exp-bansko-loom-patterns",
        visitor: { displayName: "Synthetic Demo Visitor", email: "visitor@example.com" },
        partySize: 2,
        preferredDate: "2026-09-04",
        message: "Synthetic demonstration request only.",
        synthetic: true,
      }),
      JSON.stringify(validate.errors),
    ).toBe(true);
  });

  it("rejects real email domains and non-synthetic requests", () => {
    expect(
      validate({
        experienceId: "exp-bansko-loom-patterns",
        visitor: { displayName: "A Person", email: "person@real-domain.invalid" },
        partySize: 2,
        synthetic: false,
      }),
    ).toBe(false);
  });
});
