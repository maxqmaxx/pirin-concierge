import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

interface OpenApiDocument {
  openapi: string;
  jsonSchemaDialect?: string;
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, Record<string, unknown>>;
  };
}

function loadOpenApi(): OpenApiDocument {
  const url = new URL("../openapi/openapi.yaml", import.meta.url);
  return parse(readFileSync(fileURLToPath(url), "utf8")) as OpenApiDocument;
}

describe("published contracts", () => {
  it("uses OpenAPI 3.1 and exposes every required laboratory endpoint", () => {
    const contract = loadOpenApi();
    expect(contract.openapi).toBe("3.1.0");
    expect(contract.jsonSchemaDialect).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(Object.keys(contract.paths)).toEqual(
      expect.arrayContaining([
        "/health",
        "/api/v1/experiences",
        "/api/v1/experiences/search",
        "/api/v1/experiences/{id}",
        "/api/v1/concierge/search",
        "/api/v1/booking-requests",
        "/api/v1/demo/outbox",
      ]),
    );
  });

  it("publishes no payment, checkout or automatic-confirmation route", () => {
    const contract = loadOpenApi();
    const routeNames = Object.keys(contract.paths).join(" ");
    expect(routeNames).not.toMatch(/payment|checkout|charge|confirm/iu);
  });

  it("keeps booking and outbox state contracts distinct", () => {
    const schemas = loadOpenApi().components.schemas;
    const booking = schemas.BookingRequest?.properties as
      | Record<string, Record<string, unknown>>
      | undefined;
    const outbox = schemas.DemoOutboxMessage?.properties as
      | Record<string, Record<string, unknown>>
      | undefined;

    expect(booking?.status?.const).toBe("pending_host_confirmation");
    expect(booking?.requiresHostConfirmation?.const).toBe(true);
    expect(booking?.paymentCollected?.const).toBe(false);
    expect(booking?.automaticallyConfirmed?.const).toBe(false);
    expect(outbox?.status?.const).toBe("received");
  });
});
