import {
  Client,
  type FetchLike,
  InMemoryTransport,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { getDemoOutbox, resetDemoState } from "../src/booking.js";
import { createPirinMcpHandler, createPirinMcpServer } from "../src/mcp.js";

describe("official MCP client contract", () => {
  it("lists and calls all four Pirin Concierge tools", async () => {
    resetDemoState();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createPirinMcpServer();
    const client = new Client({ name: "pirin-concierge-contract-test", version: "0.1.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    try {
      const listed = await client.listTools();
      expect(listed.tools.map(({ name }) => name).sort()).toEqual([
        "get_experience",
        "initiate_booking_request",
        "list_by_area",
        "search_experiences",
      ]);

      const searchResult = await client.callTool({
        name: "search_experiences",
        arguments: { query: "weaving", limit: 3 },
      });
      expect(searchResult.isError).not.toBe(true);

      const getResult = await client.callTool({
        name: "get_experience",
        arguments: { id: "exp-bansko-loom-patterns" },
      });
      expect(getResult.isError).not.toBe(true);

      const areaResult = await client.callTool({
        name: "list_by_area",
        arguments: { area: "Banya" },
      });
      expect(areaResult.isError).not.toBe(true);

      const bookingResult = await client.callTool({
        name: "initiate_booking_request",
        arguments: {
          experienceId: "exp-bansko-loom-patterns",
          visitor: {
            displayName: "Synthetic MCP Visitor",
            email: "mcp-visitor@example.com",
          },
          partySize: 2,
          preferredDate: "2026-09-04",
          message: "Synthetic MCP contract test.",
          synthetic: true,
        },
      });
      expect(bookingResult.isError).not.toBe(true);

      const firstContent = bookingResult.content[0];
      if (firstContent?.type !== "text") {
        throw new Error("The booking tool did not return a text evidence block.");
      }
      const receipt = JSON.parse(firstContent.text) as Record<string, unknown>;
      expect(receipt).toMatchObject({
        status: "pending_host_confirmation",
        requiresHostConfirmation: true,
        paymentCollected: false,
        automaticallyConfirmed: false,
        synthetic: true,
      });
      expect(getDemoOutbox()).toHaveLength(1);
    } finally {
      await client.close();
      await server.close();
    }
  });

  it("negotiates the 2026 protocol over hosted Streamable HTTP and calls a tool", async () => {
    const handler = createPirinMcpHandler();
    const fetchThroughHandler: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      return handler.fetch(request);
    };
    const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
      fetch: fetchThroughHandler,
    });
    const client = new Client(
      { name: "pirin-concierge-streamable-http-test", version: "0.1.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      expect(client.getProtocolEra()).toBe("modern");
      expect(client.getNegotiatedProtocolVersion()).toMatch(/^2026-/u);

      const listed = await client.listTools();
      expect(listed.tools.map(({ name }) => name)).toContain("search_experiences");

      const result = await client.callTool({
        name: "search_experiences",
        arguments: { query: "weaving", area: "Bansko", limit: 3 },
      });
      expect(result.isError).not.toBe(true);
    } finally {
      await Promise.allSettled([client.close(), handler.close()]);
    }
  });
});
