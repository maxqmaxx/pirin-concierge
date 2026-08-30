import { readFileSync } from "node:fs";
import { createMcpHonoApp, type CreateMcpHonoAppOptions } from "@modelcontextprotocol/hono";
import { createBookingRequest, getDemoOutbox, parseBookingRequestInput } from "./booking.js";
import { experiences, getExperience, searchExperiences } from "./catalog.js";
import { answerConcierge, experienceSourceUrl } from "./concierge.js";
import { experienceJsonLd } from "./jsonld.js";
import { mcpHandler } from "./mcp.js";
import { DemoValidationError, type ConciergeInput } from "./types.js";

const OPENAPI_FILE_URL = new URL("../openapi/openapi.yaml", import.meta.url);
const SETTLEMENTS = new Set(["Bansko", "Razlog", "Banya", "Dobarsko"]);
const CATEGORIES = new Set(["craft", "culinary", "heritage", "nature"]);
const LANGUAGE_PATTERN = /^[a-z]{2}$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLimit(value: string | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function validateCatalogueFilters(
  area: string | undefined,
  category: string | undefined,
  language: string | undefined,
  limit: number | undefined,
): void {
  if (area !== undefined && !SETTLEMENTS.has(area)) {
    throw new DemoValidationError("invalid_area", "area is not a supported demo settlement.");
  }
  if (category !== undefined && !CATEGORIES.has(category)) {
    throw new DemoValidationError("invalid_category", "category is not supported.");
  }
  if (language !== undefined && !LANGUAGE_PATTERN.test(language)) {
    throw new DemoValidationError("invalid_language", "language must be a two-letter code.");
  }
  if (limit !== undefined && (limit < 1 || limit > 12)) {
    throw new DemoValidationError("invalid_limit", "limit must be an integer from 1 to 12.");
  }
}

function readOptionalString(
  value: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string | undefined {
  const candidate = value[key];
  if (candidate === undefined) {
    return undefined;
  }
  if (typeof candidate !== "string" || candidate.length > maximumLength) {
    throw new DemoValidationError("invalid_request", `${key} must be a short string.`);
  }
  return candidate;
}

function assertOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): void {
  const unexpected = Object.keys(value).find((key) => !allowed.has(key));
  if (unexpected) {
    throw new DemoValidationError(
      "unknown_field",
      `The request contains an unsupported field: ${unexpected}.`,
    );
  }
}

function parseConciergeInput(value: unknown): ConciergeInput {
  if (!isRecord(value) || typeof value.query !== "string" || !value.query.trim()) {
    throw new DemoValidationError("invalid_query", "A non-empty query is required.");
  }
  assertOnlyKeys(value, new Set(["query", "area", "category", "language", "limit"]));
  if (value.query.length > 200) {
    throw new DemoValidationError("invalid_query", "query must be 200 characters or fewer.");
  }
  if (
    value.limit !== undefined &&
    (typeof value.limit !== "number" ||
      !Number.isInteger(value.limit) ||
      value.limit < 1 ||
      value.limit > 12)
  ) {
    throw new DemoValidationError("invalid_limit", "limit must be an integer from 1 to 12.");
  }
  const area = readOptionalString(value, "area", 80);
  const category = readOptionalString(value, "category", 80);
  const language = readOptionalString(value, "language", 40);
  validateCatalogueFilters(area, category, language, value.limit as number | undefined);

  return {
    query: value.query,
    ...(area ? { area } : {}),
    ...(category ? { category } : {}),
    ...(language ? { language } : {}),
    ...(typeof value.limit === "number" ? { limit: value.limit } : {}),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function page(title: string, body: string, jsonLd?: Record<string, unknown>): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Pirin Concierge</title>
    <meta name="description" content="A synthetic TRL 4 reference demonstrator for rural experience discovery.">
    ${jsonLd ? `<script type="application/ld+json">${safeJsonForHtml(jsonLd)}</script>` : ""}
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; line-height: 1.55; }
      body { max-width: 68rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; color: #17231b; background: #f6f8f3; }
      header, main, footer { display: block; }
      a { color: #17633a; }
      .notice { padding: .8rem 1rem; border-left: .3rem solid #c58c22; background: #fff8e8; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; padding: 0; }
      .card { list-style: none; padding: 1rem; background: white; border: 1px solid #dfe8dc; border-radius: .75rem; }
      dt { font-weight: 700; } dd { margin: 0 0 .65rem; }
      code { background: #e7eee4; padding: .1rem .3rem; border-radius: .25rem; }
    </style>
  </head>
  <body>
    <header><a href="/">Pirin Concierge</a></header>
    <main>${body}</main>
    <footer><p>Apache-2.0 reference demonstrator · synthetic data only</p></footer>
  </body>
</html>`;
}

function parseHostnameList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        return new URL(entry).hostname;
      } catch {
        return entry;
      }
    });
}

function appOptions(): CreateMcpHonoAppOptions {
  const host = process.env.HOST ?? "127.0.0.1";
  const allowedHosts = parseHostnameList(process.env.ALLOWED_HOSTS);
  const allowedOrigins = parseHostnameList(process.env.ALLOWED_ORIGINS);
  return {
    host,
    ...(allowedHosts.length > 0 ? { allowedHosts } : {}),
    ...(allowedOrigins.length > 0 ? { allowedOrigins } : {}),
  };
}

export function createApp(overrides: CreateMcpHonoAppOptions = {}) {
  const application = createMcpHonoApp({ ...appOptions(), ...overrides });

  application.use("*", async (context, next) => {
    await next();
    context.header("X-Content-Type-Options", "nosniff");
    context.header("X-Frame-Options", "DENY");
    context.header("Referrer-Policy", "no-referrer");
    context.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    context.header(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    context.header("X-Pirin-Demo-Data", "synthetic-only");
  });

  application.get("/health", (context) =>
    context.json({
      status: "ok",
      version: "0.1.0-trl4",
      dataset: "synthetic",
    }),
  );

  application.get("/api/v1/experiences/search", (context) => {
    const area = context.req.query("area");
    const category = context.req.query("category");
    const language = context.req.query("language");
    const rawLimit = context.req.query("limit");
    const limit = parseLimit(rawLimit);
    const query = context.req.query("q");
    try {
      if (!query?.trim() || query.length > 200) {
        throw new DemoValidationError("invalid_query", "q must contain 1 to 200 characters.");
      }
      if (rawLimit !== undefined && limit === undefined) {
        throw new DemoValidationError("invalid_limit", "limit must be an integer from 1 to 12.");
      }
      validateCatalogueFilters(area, category, language, limit);
    } catch (error) {
      if (error instanceof DemoValidationError) {
        return context.json({ error: { code: error.code, message: error.message } }, 400);
      }
      throw error;
    }
    const results = searchExperiences({
      query,
      ...(area ? { area } : {}),
      ...(category ? { category } : {}),
      ...(language ? { language } : {}),
      ...(limit ? { limit } : {}),
    });
    return context.json({ experiences: results, count: results.length, synthetic: true });
  });

  application.get("/api/v1/experiences", (context) => {
    const area = context.req.query("area");
    const category = context.req.query("category");
    const language = context.req.query("language");
    const rawLimit = context.req.query("limit");
    const limit = parseLimit(rawLimit);
    try {
      if (rawLimit !== undefined && limit === undefined) {
        throw new DemoValidationError("invalid_limit", "limit must be an integer from 1 to 12.");
      }
      validateCatalogueFilters(area, category, language, limit);
    } catch (error) {
      if (error instanceof DemoValidationError) {
        return context.json({ error: { code: error.code, message: error.message } }, 400);
      }
      throw error;
    }
    const results = searchExperiences({
      ...(area ? { area } : {}),
      ...(category ? { category } : {}),
      ...(language ? { language } : {}),
      ...(limit ? { limit } : {}),
    });
    return context.json({ experiences: results, count: results.length, synthetic: true });
  });

  application.get("/api/v1/experiences/:id", (context) => {
    const experience = getExperience(context.req.param("id"));
    if (!experience) {
      return context.json(
        { error: { code: "experience_not_found", message: "No experience has that id or slug." } },
        404,
      );
    }
    const baseUrl = new URL(context.req.url).origin;
    return context.json({
      experience,
      sourceUrl: experienceSourceUrl(experience, baseUrl),
      synthetic: true,
    });
  });

  application.post("/api/v1/concierge/search", async (context) => {
    try {
      const input = parseConciergeInput(await context.req.json<unknown>());
      return context.json(answerConcierge(input, new URL(context.req.url).origin));
    } catch (error) {
      if (error instanceof DemoValidationError || error instanceof SyntaxError) {
        return context.json(
          {
            error: {
              code: error instanceof DemoValidationError ? error.code : "invalid_json",
              message: error.message,
            },
          },
          400,
        );
      }
      return context.json(
        { error: { code: "concierge_failed", message: "The demo query could not be processed." } },
        500,
      );
    }
  });

  application.post("/api/v1/booking-requests", async (context) => {
    try {
      const input = parseBookingRequestInput(await context.req.json<unknown>());
      return context.json(createBookingRequest(input), 201);
    } catch (error) {
      if (error instanceof DemoValidationError || error instanceof SyntaxError) {
        const code = error instanceof DemoValidationError ? error.code : "invalid_json";
        const status = code === "experience_not_found" ? 404 : 400;
        return context.json({ error: { code, message: error.message } }, status);
      }
      return context.json(
        {
          error: {
            code: "booking_request_failed",
            message: "The demo request could not be created.",
          },
        },
        500,
      );
    }
  });

  application.get("/api/v1/demo/outbox", (context) => {
    const entries = getDemoOutbox();
    return context.json({ entries, count: entries.length, synthetic: true });
  });

  application.get("/openapi.yaml", (context) => {
    try {
      return context.body(readFileSync(OPENAPI_FILE_URL, "utf8"), 200, {
        "Content-Type": "application/yaml; charset=utf-8",
      });
    } catch {
      return context.json(
        { error: { code: "openapi_unavailable", message: "The OpenAPI document is unavailable." } },
        503,
      );
    }
  });

  application.get("/", (context) => {
    const cards = experiences
      .map(
        (experience) => `<li class="card">
          <h2><a href="/experiences/${encodeURIComponent(experience.slug)}">${escapeHtml(experience.name)}</a></h2>
          <p>${escapeHtml(experience.settlement)} · ${escapeHtml(experience.category)}</p>
          <p>${escapeHtml(experience.description)}</p>
        </li>`,
      )
      .join("\n");
    return context.html(
      page(
        "Synthetic experience catalogue",
        `<h1>Pirin Concierge</h1>
        <p class="notice"><strong>TRL 4 reference demonstrator.</strong> All people, hosts, offers and booking requests shown here are synthetic. Requests require host confirmation and this service never collects payment.</p>
        <p><a href="/openapi.yaml">OpenAPI 3.1</a> · MCP endpoint: <code>/mcp</code></p>
        <ul class="grid">${cards}</ul>`,
      ),
    );
  });

  application.get("/experiences/:id", (context) => {
    const experience = getExperience(context.req.param("id"));
    if (!experience) {
      return context.html(page("Not found", "<h1>Experience not found</h1>"), 404);
    }
    const baseUrl = new URL(context.req.url).origin;
    const jsonLd = experienceJsonLd(experience, baseUrl);
    return context.html(
      page(
        experience.name,
        `<h1>${escapeHtml(experience.name)}</h1>
        <p class="notice">Synthetic demo record. Availability and price are indicative. The host must confirm a request and receives payment directly off-platform.</p>
        <p>${escapeHtml(experience.description)}</p>
        <dl>
          <dt>Settlement</dt><dd>${escapeHtml(experience.settlement)}</dd>
          <dt>Category</dt><dd>${escapeHtml(experience.category)}</dd>
          <dt>Languages</dt><dd>${escapeHtml(experience.languages.join(", "))}</dd>
          <dt>Duration</dt><dd>${experience.durationMinutes} minutes</dd>
          <dt>Indicative price</dt><dd>${experience.indicativePrice.amount} ${experience.indicativePrice.currency}</dd>
          <dt>Host</dt><dd>${escapeHtml(experience.host.displayName)} (synthetic)</dd>
        </dl>`,
        jsonLd,
      ),
    );
  });

  application.all("/mcp", (context) => {
    return mcpHandler.fetch(context.req.raw);
  });

  return application;
}

export const app = createApp();
export default app;
