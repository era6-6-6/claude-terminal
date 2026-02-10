/**
 * Web App Terminal Panel
 * Dev server console view with info panel + live preview
 */

const { getWebAppServer, setWebAppPort } = require('./WebAppState');
const { getSetting } = require('../../../renderer/state/settings.state');
const api = window.electron_api;

// Track active poll timer per wrapper (shared between views)
const pollTimers = new WeakMap();

function clearPollTimer(wrapper) {
  const timer = pollTimers.get(wrapper);
  if (timer) {
    clearInterval(timer);
    pollTimers.delete(wrapper);
  }
}

function startPortPoll(wrapper, projectIndex, onFound) {
  clearPollTimer(wrapper);
  const timer = setInterval(async () => {
    const s = getWebAppServer(projectIndex);
    if (s.status === 'stopped') { clearPollTimer(wrapper); return; }
    let p = s.port;
    if (!p) {
      try { p = await api.webapp.getPort({ projectIndex }); } catch (e) {}
    }
    if (p) {
      setWebAppPort(projectIndex, p);
      clearPollTimer(wrapper);
      onFound(p);
    }
  }, 2000);
  pollTimers.set(wrapper, timer);
}

async function resolvePort(projectIndex) {
  const server = getWebAppServer(projectIndex);
  if (server.port) return server.port;
  if (server.status !== 'running') return null;
  try {
    const p = await api.webapp.getPort({ projectIndex });
    if (p) setWebAppPort(projectIndex, p);
    return p || null;
  } catch (e) { return null; }
}

function isPreviewEnabled() {
  const val = getSetting('webappPreviewEnabled');
  return val !== undefined ? val : true; // default: enabled
}

function getViewSwitcherHtml() {
  const previewEnabled = isPreviewEnabled();
  return `
    <div class="webapp-view-switcher">
      <button class="webapp-view-tab active" data-view="console">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V8h16v10z"/><path d="M7 10l4 3-4 3v-6z"/></svg>
        Console
      </button>
      ${previewEnabled ? `
        <button class="webapp-view-tab" data-view="preview">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          Preview
        </button>
      ` : ''}
      <button class="webapp-view-tab" data-view="info">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        Info
      </button>
    </div>
    <div class="webapp-view-content">
      <div class="webapp-console-view"></div>
      ${previewEnabled ? `<div class="webapp-preview-view" style="display: none;"></div>` : ''}
      <div class="webapp-info-view" style="display: none;"></div>
    </div>
  `;
}

function setupViewSwitcher(wrapper, terminalId, projectIndex, project, deps) {
  const { t, getTerminal } = deps;
  const consoleView = wrapper.querySelector('.webapp-console-view');
  const previewView = wrapper.querySelector('.webapp-preview-view');
  const infoView = wrapper.querySelector('.webapp-info-view');

  wrapper.querySelectorAll('.webapp-view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;

      wrapper.querySelectorAll('.webapp-view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      consoleView.style.display = view === 'console' ? '' : 'none';
      if (previewView) previewView.style.display = view === 'preview' ? '' : 'none';
      infoView.style.display = view === 'info' ? '' : 'none';

      // Suspend iframe when leaving preview to save resources
      if (view !== 'preview' && previewView) {
        suspendPreview(previewView);
      }

      if (view === 'console') {
        const termData = getTerminal(terminalId);
        if (termData) setTimeout(() => termData.fitAddon.fit(), 50);
      } else if (view === 'preview') {
        renderPreviewView(wrapper, projectIndex, project, deps);
      } else if (view === 'info') {
        renderInfoView(wrapper, projectIndex, project, deps);
      }

      const termData = getTerminal(terminalId);
      if (termData) termData.activeView = view;
    });
  });
}

/**
 * Suspend iframe by replacing src with about:blank (preserves DOM, stops JS execution)
 */
function suspendPreview(previewView) {
  const iframe = previewView.querySelector('.webapp-preview-iframe');
  if (iframe && iframe.src !== 'about:blank') {
    iframe.dataset.lastSrc = iframe.src;
    iframe.src = 'about:blank';
  }
}

/**
 * Resume iframe from suspended state
 */
function resumePreview(previewView) {
  const iframe = previewView.querySelector('.webapp-preview-iframe');
  if (iframe && iframe.dataset.lastSrc) {
    iframe.src = iframe.dataset.lastSrc;
    delete iframe.dataset.lastSrc;
  }
}

async function renderPreviewView(wrapper, projectIndex, project, deps) {
  const { t } = deps;
  const previewView = wrapper.querySelector('.webapp-preview-view');
  if (!previewView) return;

  const port = await resolvePort(projectIndex);
  const server = getWebAppServer(projectIndex);

  if (!port) {
    // Check if iframe was previously loaded — clear it
    if (previewView.dataset.loadedPort) {
      delete previewView.dataset.loadedPort;
    }

    previewView.innerHTML = `
      <div class="webapp-preview-empty">
        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style="opacity:0.2"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        <span>${server.status === 'stopped' ? t('webapp.stopped') : t('webapp.detecting')}</span>
      </div>
    `;

    if (server.status !== 'stopped') {
      startPortPoll(wrapper, projectIndex, () => {
        renderPreviewView(wrapper, projectIndex, project, deps);
      });
    }
    return;
  }

  clearPollTimer(wrapper);
  const url = `http://localhost:${port}`;

  // Resume if same port was already loaded (just suspended)
  const existingIframe = previewView.querySelector('.webapp-preview-iframe');
  if (existingIframe && previewView.dataset.loadedPort === String(port)) {
    if (existingIframe.dataset.lastSrc) {
      resumePreview(previewView);
    }
    return;
  }

  previewView.dataset.loadedPort = String(port);

  previewView.innerHTML = `
    <div class="webapp-preview-toolbar">
      <button class="webapp-preview-btn webapp-preview-back" title="Back">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <button class="webapp-preview-btn webapp-preview-forward" title="Forward">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
      </button>
      <button class="webapp-preview-btn webapp-preview-reload" title="${t('webapp.reload') || 'Reload'}">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
      </button>
      <div class="webapp-preview-urlbar">
        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style="opacity:0.4;flex-shrink:0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        <input class="webapp-preview-url-input" value="${url}" readonly />
      </div>
      <button class="webapp-preview-btn webapp-preview-open" title="${t('webapp.openBrowser')}">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/><path d="M5 5v14h14v-7h-2v5H7V7h5V5H5z"/></svg>
      </button>
    </div>
    <iframe class="webapp-preview-iframe" src="${url}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"></iframe>
  `;

  const iframe = previewView.querySelector('.webapp-preview-iframe');
  previewView.querySelector('.webapp-preview-reload').onclick = () => {
    iframe.contentWindow.location.reload();
  };
  previewView.querySelector('.webapp-preview-back').onclick = () => {
    try { iframe.contentWindow.history.back(); } catch (e) {}
  };
  previewView.querySelector('.webapp-preview-forward').onclick = () => {
    try { iframe.contentWindow.history.forward(); } catch (e) {}
  };
  previewView.querySelector('.webapp-preview-open').onclick = () => {
    api.dialog.openExternal(url);
  };
}

async function renderInfoView(wrapper, projectIndex, project, deps) {
  const { t } = deps;
  const server = getWebAppServer(projectIndex);
  const infoView = wrapper.querySelector('.webapp-info-view');
  if (!infoView) return;

  const port = await resolvePort(projectIndex);
  const url = port ? `http://localhost:${port}` : null;
  const statusKey = server.status === 'stopped' ? 'webapp.stopped'
    : server.status === 'starting' ? 'webapp.starting'
    : 'webapp.running';

  infoView.innerHTML = `
    <div class="webapp-info-panel">
      <div class="webapp-info-row">
        <span class="webapp-info-label">${t('webapp.devCommand')}</span>
        <span class="webapp-info-value"><code>${project.devCommand || 'auto-detect'}</code></span>
      </div>
      <div class="webapp-info-row">
        <span class="webapp-info-label">Status</span>
        <span class="webapp-info-value">
          <span class="webapp-status-dot ${server.status}"></span>
          ${t(statusKey)}
        </span>
      </div>
      ${port ? `
        <div class="webapp-info-row">
          <span class="webapp-info-label">${t('webapp.port')}</span>
          <span class="webapp-info-value"><code>${port}</code></span>
        </div>
        <div class="webapp-info-row clickable webapp-open-url" data-url="${url}">
          <span class="webapp-info-label">${t('webapp.url')}</span>
          <span class="webapp-info-value">
            <span class="webapp-url-link">${url}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style="margin-left:6px;opacity:0.5"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/><path d="M5 5v14h14v-7h-2v5H7V7h5V5H5z"/></svg>
          </span>
        </div>
      ` : server.status === 'running' ? `
        <div class="webapp-info-row">
          <span class="webapp-info-label">${t('webapp.port')}</span>
          <span class="webapp-info-value">${t('webapp.detecting')}</span>
        </div>
      ` : ''}
    </div>
  `;

  infoView.querySelectorAll('.webapp-open-url').forEach(row => {
    row.style.cursor = 'pointer';
    row.onclick = () => {
      const urlToOpen = row.dataset.url;
      if (urlToOpen) api.dialog.openExternal(urlToOpen);
    };
  });

  if (!port && server.status === 'running') {
    startPortPoll(wrapper, projectIndex, () => {
      renderInfoView(wrapper, projectIndex, project, deps);
    });
  }
}

/**
 * Cleanup all timers and iframe for a wrapper (called on close)
 */
function cleanup(wrapper) {
  clearPollTimer(wrapper);
  const previewView = wrapper.querySelector('.webapp-preview-view');
  if (previewView) {
    const iframe = previewView.querySelector('.webapp-preview-iframe');
    if (iframe) iframe.src = 'about:blank';
    delete previewView.dataset.loadedPort;
  }
}

module.exports = {
  getViewSwitcherHtml,
  setupViewSwitcher,
  renderPreviewView,
  renderInfoView,
  cleanup
};
