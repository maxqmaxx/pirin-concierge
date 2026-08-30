import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { resetDemoState } from "../src/booking.js";

const validBookingInput = {
  experienceId: "exp-bansko-loom-patterns",
  visitor: {
    displayName: "Synthetic REST Visitor",
    email: "rest-visitor@example.com",
  },
  partySize: 2,
  preferredDate: "2026-09-04",
  message: "Synthetic REST contract test.",
  synthetic: true,
};

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("host", "localhost");
  return app.request(new URL(path, "http://localhost").href, { ...init, headers });
}

async function postJson(path: string, value: unknown): Promise<Response> {
  return request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });
}

describe("REST API contract", () => {
  beforeEach(() => resetDemoState());

  it("serves health and applies laboratory security headers", async () => {
    const response = await request("/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      version: "0.1.0-trl4",
      dataset: "synthetic",
    });
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-pirin-demo-data")).toBe("synthetic-only");
  });

  it("lists, searches and gets the same synthetic catalogue records", async () => {
    const listResponse = await request("/api/v1/experiences?area=Bansko");
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as {
      experiences: Array<{ id: string; settlement: string; synthetic: boolean }>;
      count: number;
      synthetic: boolean;
    };
    expect(list.count).toBe(3);
    expect(list.synthetic).toBe(true);
    expect(list.experiences.every(({ settlement }) => settlement === "Bansko")).toBe(true);

    const searchResponse = await request("/api/v1/experiences/search?q=weaving");
    expect(searchResponse.status).toBe(200);
    const search = (await searchResponse.json()) as {
      experiences: Array<{ id: string }>;
      count: number;
      synthetic: boolean;
    };
    expect(search.experiences.map(({ id }) => id)).toContain("exp-bansko-loom-patterns");

    const getResponse = await request("/api/v1/experiences/exp-bansko-loom-patterns");
    expect(getResponse.status).toBe(200);
    const detail = (await getResponse.json()) as {
      experience: { id: string; synthetic: boolean; bookingMode: string };
      sourceUrl: string;
      synthetic: boolean;
    };
    expect(detail).toMatchObject({
      experience: {
        id: "exp-bansko-loom-patterns",
        synthetic: true,
        bookingMode: "request_only",
      },
      synthetic: true,
    });
    expect(detail.sourceUrl).toMatch(/\/experiences\/bansko-loom-patterns$/u);
  });

  it("returns only catalogue-grounded concierge matches and sources", async () => {
    const response = await postJson("/api/v1/concierge/search", {
      query: "craft in Bansko",
      area: "Bansko",
      limit: 3,
    });
    expect(response.status).toBe(200);
    const result = (await response.json()) as {
      answer: string;
      matches: Array<{ experience: { id: string }; sourceUrl: string }>;
      sources: Array<{ experienceId: string; url: string }>;
      groundedInCatalog: boolean;
      synthetic: boolean;
    };
    expect(result.groundedInCatalog).toBe(true);
    expect(result.synthetic).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.answer).toContain("host must confirm every request");
    expect(result.sources.map(({ experienceId }) => experienceId)).toEqual(
      result.matches.map(({ experience }) => experience.id),
    );
  });

  it("creates a pending request and exposes only non-personal outbox evidence", async () => {
    const createResponse = await postJson("/api/v1/booking-requests", validBookingInput);
    expect(createResponse.status).toBe(201);
    const receipt = (await createResponse.json()) as Record<string, unknown>;
    expect(receipt).toMatchObject({
      experienceId: validBookingInput.experienceId,
      status: "pending_host_confirmation",
      requiresHostConfirmation: true,
      paymentCollected: false,
      automaticallyConfirmed: false,
      synthetic: true,
    });
    expect(JSON.stringify(receipt)).not.toContain(validBookingInput.visitor.email);

    const outboxResponse = await request("/api/v1/demo/outbox");
    expect(outboxResponse.status).toBe(200);
    const outbox = (await outboxResponse.json()) as {
      entries: Array<Record<string, unknown>>;
      count: number;
      synthetic: boolean;
    };
    expect(outbox.count).toBe(1);
    expect(outbox.synthetic).toBe(true);
    expect(outbox.entries[0]).toMatchObject({
      requestId: receipt.id,
      status: "received",
      synthetic: true,
    });
    expect(JSON.stringify(outbox)).not.toContain(validBookingInput.visitor.email);
    expect(JSON.stringify(outbox)).not.toContain(validBookingInput.message);
  });

  it("rejects real email domains and payment or confirmation fields", async () => {
    const realEmailResponse = await postJson("/api/v1/booking-requests", {
      ...validBookingInput,
      visitor: { displayName: "Real Visitor", email: "visitor@real-domain.invalid" },
    });
    expect(realEmailResponse.status).toBe(400);
    expect(await realEmailResponse.json()).toMatchObject({
      error: { code: "synthetic_email_required" },
    });

    for (const forbiddenField of ["payment", "confirmed"] as const) {
      const response = await postJson("/api/v1/booking-requests", {
        ...validBookingInput,
        [forbiddenField]: true,
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: { code: "unknown_field" } });
    }
    expect((await (await request("/api/v1/demo/outbox")).json()) as object).toMatchObject({
      count: 0,
    });
  });

  it("serves reproducible HTML and OpenAPI evidence", async () => {
    const homeResponse = await request("/");
    expect(homeResponse.status).toBe(200);
    const home = await homeResponse.text();
    expect(home).toContain("TRL 4 reference demonstrator");
    expect(home).toContain("bansko-loom-patterns");
    expect(home).toContain("Requests require host confirmation");

    const pageResponse = await request("/experiences/bansko-loom-patterns");
    expect(pageResponse.status).toBe(200);
    const page = await pageResponse.text();
    expect(page).toContain('type="application/ld+json"');
    expect(page).toContain("Synthetic Host Bansko A");
    expect(page).toContain("payment directly off-platform");

    const missingPage = await request("/experiences/missing-record");
    expect(missingPage.status).toBe(404);
    expect(await missingPage.text()).toContain("Experience not found");

    const specification = await request("/openapi.yaml");
    expect(specification.status).toBe(200);
    expect(specification.headers.get("content-type")).toContain("application/yaml");
    expect(await specification.text()).toContain("openapi: 3.1.0");
  });

  it("returns structured errors for invalid discovery inputs", async () => {
    const invalidArea = await request("/api/v1/experiences?area=Unknown");
    expect(invalidArea.status).toBe(400);
    expect(await invalidArea.json()).toMatchObject({ error: { code: "invalid_area" } });

    const invalidLimit = await request("/api/v1/experiences?limit=not-a-number");
    expect(invalidLimit.status).toBe(400);
    expect(await invalidLimit.json()).toMatchObject({ error: { code: "invalid_limit" } });

    const missingQuery = await request("/api/v1/experiences/search");
    expect(missingQuery.status).toBe(400);
    expect(await missingQuery.json()).toMatchObject({ error: { code: "invalid_query" } });

    const missingRecord = await request("/api/v1/experiences/exp-missing-record");
    expect(missingRecord.status).toBe(404);
    expect(await missingRecord.json()).toMatchObject({
      error: { code: "experience_not_found" },
    });

    const invalidConcierge = await postJson("/api/v1/concierge/search", {
      query: "",
      payment: true,
    });
    expect(invalidConcierge.status).toBe(400);
    expect(await invalidConcierge.json()).toMatchObject({ error: { code: "invalid_query" } });
  });
});
