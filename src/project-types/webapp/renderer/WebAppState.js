/**
 * Web App State Module
 * Manages dev server state
 */

const { State } = require('../../../renderer/state/State');

const initialState = {
  webappServers: new Map(), // projectIndex -> { status, logs[], port, framework }
};

const webappState = new State(initialState);

function getWebAppServer(projectIndex) {
  return webappState.get().webappServers.get(projectIndex) || {
    status: 'stopped',
    logs: [],
    port: null,
    framework: null
  };
}

function setWebAppServerStatus(projectIndex, status) {
  const servers = webappState.get().webappServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [], port: null, framework: null };
  servers.set(projectIndex, { ...current, status });
  webappState.setProp('webappServers', servers);
}

function setWebAppPort(projectIndex, port) {
  const servers = webappState.get().webappServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [], port: null, framework: null };
  servers.set(projectIndex, { ...current, port });
  webappState.setProp('webappServers', servers);
}

function setWebAppFramework(projectIndex, framework) {
  const servers = webappState.get().webappServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [], port: null, framework: null };
  servers.set(projectIndex, { ...current, framework });
  webappState.setProp('webappServers', servers);
}

function addWebAppLog(projectIndex, data) {
  const servers = webappState.get().webappServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [], port: null, framework: null };
  const logs = [...current.logs, data];
  let combined = logs.join('');
  if (combined.length > 10000) combined = combined.slice(-10000);
  servers.set(projectIndex, { ...current, logs: [combined] });
  webappState.setProp('webappServers', servers);
}

function clearWebAppLogs(projectIndex) {
  const servers = webappState.get().webappServers;
  const current = servers.get(projectIndex);
  if (current) {
    servers.set(projectIndex, { ...current, logs: [] });
    webappState.setProp('webappServers', servers);
  }
}

function initWebAppServer(projectIndex) {
  const servers = webappState.get().webappServers;
  if (!servers.has(projectIndex)) {
    servers.set(projectIndex, { status: 'stopped', logs: [], port: null, framework: null });
    webappState.setProp('webappServers', servers);
  }
}

function removeWebAppServer(projectIndex) {
  const servers = webappState.get().webappServers;
  servers.delete(projectIndex);
  webappState.setProp('webappServers', servers);
}

module.exports = {
  webappState,
  getWebAppServer,
  setWebAppServerStatus,
  setWebAppPort,
  setWebAppFramework,
  addWebAppLog,
  clearWebAppLogs,
  initWebAppServer,
  removeWebAppServer
};
