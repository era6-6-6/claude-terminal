/**
 * Web App IPC Handlers
 */

const { ipcMain } = require('electron');
const webAppService = require('./WebAppService');

function registerHandlers() {
  ipcMain.handle('webapp-start', async (event, { projectIndex, projectPath, devCommand }) => {
    return webAppService.start({ projectIndex, projectPath, devCommand });
  });

  ipcMain.handle('webapp-stop', async (event, { projectIndex }) => {
    return webAppService.stop({ projectIndex });
  });

  ipcMain.on('webapp-input', (event, { projectIndex, data }) => {
    webAppService.write(projectIndex, data);
  });

  ipcMain.on('webapp-resize', (event, { projectIndex, cols, rows }) => {
    webAppService.resize(projectIndex, cols, rows);
  });

  ipcMain.handle('webapp-detect-framework', async (event, { projectPath }) => {
    return webAppService.detectFramework(projectPath);
  });

  ipcMain.handle('webapp-get-port', async (event, { projectIndex }) => {
    return webAppService.getDetectedPort(projectIndex);
  });
}

module.exports = { registerHandlers, registerWebAppHandlers: registerHandlers };
