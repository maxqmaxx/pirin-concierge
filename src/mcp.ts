import {
  createMcpHandler as createSdkMcpHandler,
  McpServer,
  type McpHttpHandler,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { createBookingRequest } from "./booking.js";
import { getExperience, listByArea, searchExperiences } from "./catalog.js";
import { experienceSourceUrl } from "./concierge.js";
import { DemoValidationError, type BookingRequestInput } from "./types.js";

const searchSchema = z
  .object({
    query: z.string().max(200).default(""),
    area: z.string().max(80).optional(),
    category: z.string().max(80).optional(),
    language: z.string().max(40).optional(),
    limit: z.number().int().min(1).max(12).default(5),
  })
  .strict();

const experienceIdSchema = z.object({ id: z.string().min(1).max(120) }).strict();
const areaSchema = z.object({ area: z.string().min(1).max(80) }).strict();
const bookingSchema = z
  .object({
    experienceId: z.string().min(1).max(120),
    visitor: z
      .object({
        displayName: z.string().min(1).max(80),
        email: z
          .string()
          .max(254)
          .regex(/^[^\s@]+@example\.com$/u),
      })
      .strict(),
    partySize: z.number().int().min(1).max(12),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .optional(),
    message: z.string().max(500).optional(),
    synthetic: z.literal(true),
  })
  .strict();

function asStructuredContent(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function successfulToolResult(value: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: asStructuredContent(value),
  };
}

function failedToolResult(code: string, message: string) {
  const error = { error: { code, message } };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(error) }],
    isError: true,
  };
}

export function createPirinMcpServer(): McpServer {
  const server = new McpServer({
    name: "pirin-concierge-reference",
    version: "0.1.0",
  });

  server.registerTool(
    "search_experiences",
    {
      title: "Search Pirin demo experiences",
      description:
        "Search the synthetic Pirin experience catalogue. Results are source-grounded and require host confirmation.",
      inputSchema: searchSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ query, area, category, language, limit }) => {
      const results = searchExperiences({
        query,
        ...(area ? { area } : {}),
        ...(category ? { category } : {}),
        ...(language ? { language } : {}),
        limit,
      }).map((experience) => ({
        ...experience,
        sourceUrl: experienceSourceUrl(experience),
      }));
      return successfulToolResult({
        experiences: results,
        count: results.length,
        synthetic: true,
      });
    },
  );

  server.registerTool(
    "get_experience",
    {
      title: "Get a Pirin demo experience",
      description:
        "Get one synthetic experience by id or slug, including its canonical source URL.",
      inputSchema: experienceIdSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ id }) => {
      const experience = getExperience(id);
      if (!experience) {
        return failedToolResult(
          "experience_not_found",
          "No synthetic experience has that id or slug.",
        );
      }
      return successfulToolResult({
        experience: { ...experience, sourceUrl: experienceSourceUrl(experience) },
        synthetic: true,
      });
    },
  );

  server.registerTool(
    "list_by_area",
    {
      title: "List Pirin demo experiences by area",
      description: "List synthetic experiences in a Pirin settlement or area.",
      inputSchema: areaSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ area }) => {
      const results = listByArea(area).map((experience) => ({
        ...experience,
        sourceUrl: experienceSourceUrl(experience),
      }));
      return successfulToolResult({
        area,
        experiences: results,
        count: results.length,
        synthetic: true,
      });
    },
  );

  server.registerTool(
    "initiate_booking_request",
    {
      title: "Initiate a synthetic booking request",
      description:
        "Create a synthetic request only. The host must confirm it and no payment is collected or processed.",
      inputSchema: bookingSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    (input) => {
      try {
        const receipt = createBookingRequest(input as BookingRequestInput);
        return successfulToolResult(asStructuredContent(receipt));
      } catch (error) {
        if (error instanceof DemoValidationError) {
          return failedToolResult(error.code, error.message);
        }
        return failedToolResult(
          "booking_request_failed",
          "The synthetic request could not be created.",
        );
      }
    },
  );

  return server;
}

export function createMcpHandler(): McpHttpHandler {
  return createSdkMcpHandler(() => createPirinMcpServer(), {
    legacy: "stateless",
    onerror: (error) => {
      console.error("MCP request failed:", error.message);
    },
  });
}

export const createPirinMcpHandler = createMcpHandler;
export const mcpHandler = createMcpHandler();
