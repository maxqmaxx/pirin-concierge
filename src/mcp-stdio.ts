import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createPirinMcpServer } from "./mcp.js";

serveStdio(() => createPirinMcpServer(), {
  onerror: (error) => {
    // stdout is reserved exclusively for MCP protocol messages.
    console.error("MCP stdio error:", error.message);
  },
});
