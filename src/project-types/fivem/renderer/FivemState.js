/**
 * FiveM State Module
 * Manages FiveM servers state
 */

const { State } = require('../../../renderer/state/State');

// Initial state
const initialState = {
  fivemServers: new Map(), // projectIndex -> { status, logs[] }
  fivemErrors: new Map(), // projectIndex -> { errors: [{ timestamp, message, context }], lastError: null }
  fivemResources: new Map(), // projectIndex -> { resources: [], loading: boolean, lastScan: timestamp }
  fivemResourceShortcuts: new Map() // "projectIndex:resourceName" -> shortcut (e.g., "F5", "Ctrl+1")
};

const fivemState = new State(initialState);

// ========== FiveM Servers ==========

/**
 * Get FiveM server state
 * @param {number} projectIndex
 * @returns {Object}
 */
function getFivemServer(projectIndex) {
  return fivemState.get().fivemServers.get(projectIndex) || {
    status: 'stopped',
    logs: []
  };
}

/**
 * Set FiveM server status
 * @param {number} projectIndex
 * @param {string} status - 'stopped', 'starting', 'running'
 */
function setFivemServerStatus(projectIndex, status) {
  const servers = fivemState.get().fivemServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [] };
  servers.set(projectIndex, { ...current, status });
  fivemState.setProp('fivemServers', servers);
}

/**
 * Add log to FiveM server
 * @param {number} projectIndex
 * @param {string} data
 */
function addFivemLog(projectIndex, data) {
  const servers = fivemState.get().fivemServers;
  const current = servers.get(projectIndex) || { status: 'stopped', logs: [] };
  const logs = [...current.logs, data];

  // Keep last 10000 characters
  let combinedLogs = logs.join('');
  if (combinedLogs.length > 10000) {
    combinedLogs = combinedLogs.slice(-10000);
  }

  servers.set(projectIndex, {
    ...current,
    logs: [combinedLogs]
  });
  fivemState.setProp('fivemServers', servers);
}

/**
 * Clear FiveM server logs
 * @param {number} projectIndex
 */
function clearFivemLogs(projectIndex) {
  const servers = fivemState.get().fivemServers;
  const current = servers.get(projectIndex);
  if (current) {
    servers.set(projectIndex, { ...current, logs: [] });
    fivemState.setProp('fivemServers', servers);
  }
}

/**
 * Initialize FiveM server tracking
 * @param {number} projectIndex
 */
function initFivemServer(projectIndex) {
  const servers = fivemState.get().fivemServers;
  if (!servers.has(projectIndex)) {
    servers.set(projectIndex, { status: 'stopped', logs: [] });
    fivemState.setProp('fivemServers', servers);
  }
}

/**
 * Remove FiveM server tracking
 * @param {number} projectIndex
 */
function removeFivemServer(projectIndex) {
  const servers = fivemState.get().fivemServers;
  servers.delete(projectIndex);
  fivemState.setProp('fivemServers', servers);
}

// ========== FiveM Errors ==========

// Error patterns for FiveM/Lua
const FIVEM_ERROR_PATTERNS = [
  /SCRIPT ERROR:/i,
  /Error loading script/i,
  /Error running/i,
  /stack traceback:/i,
  /attempt to call/i,
  /attempt to index/i,
  /attempt to compare/i,
  /attempt to concatenate/i,
  /attempt to perform arithmetic/i,
  /bad argument/i,
  /module .* not found/i,
  /syntax error/i,
  /unexpected symbol/i,
  /FATAL ERROR/i,
  /\[ERROR\]/i,
  /lua_run failed/i
];

/**
 * Check if text contains a FiveM error
 * @param {string} text
 * @returns {boolean}
 */
function containsFivemError(text) {
  return FIVEM_ERROR_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Get FiveM errors for a project
 * @param {number} projectIndex
 * @returns {Object}
 */
function getFivemErrors(projectIndex) {
  return fivemState.get().fivemErrors.get(projectIndex) || {
    errors: [],
    lastError: null
  };
}

/**
 * Add a FiveM error
 * @param {number} projectIndex
 * @param {string} errorMessage - The error message
 * @param {string} context - Surrounding context (previous lines)
 */
function addFivemError(projectIndex, errorMessage, context) {
  const errorsMap = fivemState.get().fivemErrors;
  const current = errorsMap.get(projectIndex) || { errors: [], lastError: null };

  const newError = {
    timestamp: Date.now(),
    message: errorMessage,
    context: context
  };

  // Keep last 10 errors
  const errors = [...current.errors, newError].slice(-10);

  errorsMap.set(projectIndex, {
    errors,
    lastError: newError
  });

  fivemState.setProp('fivemErrors', errorsMap);

  return newError;
}

/**
 * Clear FiveM errors for a project
 * @param {number} projectIndex
 */
function clearFivemErrors(projectIndex) {
  const errorsMap = fivemState.get().fivemErrors;
  errorsMap.set(projectIndex, { errors: [], lastError: null });
  fivemState.setProp('fivemErrors', errorsMap);
}

/**
 * Dismiss the last error (hide the debug button)
 * @param {number} projectIndex
 */
function dismissLastError(projectIndex) {
  const errorsMap = fivemState.get().fivemErrors;
  const current = errorsMap.get(projectIndex);
  if (current) {
    errorsMap.set(projectIndex, { ...current, lastError: null });
    fivemState.setProp('fivemErrors', errorsMap);
  }
}

// ========== FiveM Resources ==========

/**
 * Get FiveM resources for a project
 * @param {number} projectIndex
 * @returns {Object}
 */
function getFivemResources(projectIndex) {
  return fivemState.get().fivemResources.get(projectIndex) || {
    resources: [],
    loading: false,
    lastScan: null
  };
}

/**
 * Set FiveM resources loading state
 * @param {number} projectIndex
 * @param {boolean} loading
 */
function setFivemResourcesLoading(projectIndex, loading) {
  const resourcesMap = fivemState.get().fivemResources;
  const current = resourcesMap.get(projectIndex) || { resources: [], loading: false, lastScan: null };
  resourcesMap.set(projectIndex, { ...current, loading });
  fivemState.setProp('fivemResources', resourcesMap);
}

/**
 * Set FiveM resources list
 * @param {number} projectIndex
 * @param {Array} resources
 */
function setFivemResources(projectIndex, resources) {
  const resourcesMap = fivemState.get().fivemResources;
  resourcesMap.set(projectIndex, {
    resources,
    loading: false,
    lastScan: Date.now()
  });
  fivemState.setProp('fivemResources', resourcesMap);
}

/**
 * Clear FiveM resources for a project
 * @param {number} projectIndex
 */
function clearFivemResources(projectIndex) {
  const resourcesMap = fivemState.get().fivemResources;
  resourcesMap.set(projectIndex, { resources: [], loading: false, lastScan: null });
  fivemState.setProp('fivemResources', resourcesMap);
}

// ========== FiveM Resource Shortcuts ==========

/**
 * Get shortcut for a resource
 * @param {number} projectIndex
 * @param {string} resourceName
 * @returns {string|null}
 */
function getResourceShortcut(projectIndex, resourceName) {
  const key = `${projectIndex}:${resourceName}`;
  return fivemState.get().fivemResourceShortcuts.get(key) || null;
}

/**
 * Set shortcut for a resource
 * @param {number} projectIndex
 * @param {string} resourceName
 * @param {string|null} shortcut - null to remove
 */
function setResourceShortcut(projectIndex, resourceName, shortcut) {
  const shortcuts = fivemState.get().fivemResourceShortcuts;
  const key = `${projectIndex}:${resourceName}`;

  if (shortcut) {
    // Remove any existing resource with this shortcut (for this project)
    shortcuts.forEach((s, k) => {
      if (k.startsWith(`${projectIndex}:`) && s === shortcut) {
        shortcuts.delete(k);
      }
    });
    shortcuts.set(key, shortcut);
  } else {
    shortcuts.delete(key);
  }

  fivemState.setProp('fivemResourceShortcuts', shortcuts);

  // Save to localStorage for persistence
  saveResourceShortcuts();
}

/**
 * Get all shortcuts for a project
 * @param {number} projectIndex
 * @returns {Map<string, string>} resourceName -> shortcut
 */
function getProjectResourceShortcuts(projectIndex) {
  const shortcuts = fivemState.get().fivemResourceShortcuts;
  const result = new Map();
  const prefix = `${projectIndex}:`;

  shortcuts.forEach((shortcut, key) => {
    if (key.startsWith(prefix)) {
      const resourceName = key.substring(prefix.length);
      result.set(resourceName, shortcut);
    }
  });

  return result;
}

/**
 * Find resource by shortcut
 * @param {number} projectIndex
 * @param {string} shortcut
 * @returns {string|null} resourceName or null
 */
function findResourceByShortcut(projectIndex, shortcut) {
  const shortcuts = fivemState.get().fivemResourceShortcuts;
  const prefix = `${projectIndex}:`;

  for (const [key, s] of shortcuts.entries()) {
    if (key.startsWith(prefix) && s === shortcut) {
      return key.substring(prefix.length);
    }
  }

  return null;
}

/**
 * Save resource shortcuts to localStorage
 */
function saveResourceShortcuts() {
  const shortcuts = fivemState.get().fivemResourceShortcuts;
  const obj = {};
  shortcuts.forEach((v, k) => { obj[k] = v; });
  localStorage.setItem('fivem-resource-shortcuts', JSON.stringify(obj));
}

/**
 * Load resource shortcuts from localStorage
 */
function loadResourceShortcuts() {
  try {
    const data = localStorage.getItem('fivem-resource-shortcuts');
    if (data) {
      const obj = JSON.parse(data);
      const shortcuts = new Map(Object.entries(obj));
      fivemState.setProp('fivemResourceShortcuts', shortcuts);
    }
  } catch (e) {
    console.error('Failed to load resource shortcuts:', e);
  }
}

module.exports = {
  fivemState,
  getFivemServer,
  setFivemServerStatus,
  addFivemLog,
  clearFivemLogs,
  initFivemServer,
  removeFivemServer,
  // FiveM errors
  containsFivemError,
  getFivemErrors,
  addFivemError,
  clearFivemErrors,
  dismissLastError,
  // FiveM resources
  getFivemResources,
  setFivemResourcesLoading,
  setFivemResources,
  clearFivemResources,
  // FiveM resource shortcuts
  getResourceShortcut,
  setResourceShortcut,
  getProjectResourceShortcuts,
  findResourceByShortcut,
  loadResourceShortcuts
};
