/**
 * MCP Registry IPC Handlers
 * Handles MCP server discovery from the official registry
 */

const { ipcMain } = require('electron');
const McpRegistryService = require('../services/McpRegistryService');

/**
 * Register MCP Registry IPC handlers
 */
function registerMcpRegistryHandlers() {
  // Browse servers
  ipcMain.handle('mcp-registry-browse', async (event, { limit, cursor }) => {
    try {
      const result = await McpRegistryService.browseServers(limit, cursor);
      return { success: true, ...result };
    } catch (e) {
      console.error('[MCP Registry IPC] Browse error:', e);
      return { success: false, error: e.message };
    }
  });

  // Search servers
  ipcMain.handle('mcp-registry-search', async (event, { query, limit }) => {
    try {
      const result = await McpRegistryService.searchServers(query, limit);
      return { success: true, ...result };
    } catch (e) {
      console.error('[MCP Registry IPC] Search error:', e);
      return { success: false, error: e.message };
    }
  });

  // Get server detail
  ipcMain.handle('mcp-registry-detail', async (event, { name }) => {
    try {
      const server = await McpRegistryService.getServerDetail(name);
      return { success: true, server };
    } catch (e) {
      console.error('[MCP Registry IPC] Detail error:', e);
      return { success: false, error: e.message };
    }
  });
}

module.exports = { registerMcpRegistryHandlers };
