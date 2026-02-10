/**
 * FiveM ProjectList Module
 * Provides sidebar buttons, icons, status indicators for FiveM projects
 */

const { t } = require('../../../renderer/i18n');

/**
 * Get primary action buttons for the sidebar
 * @param {Object} ctx - { project, projectIndex, fivemStatus, isRunning, isStarting, escapeHtml }
 * @returns {string} HTML
 */
function getSidebarButtons(ctx) {
  const { project, isRunning, isStarting } = ctx;
  if (isRunning || isStarting) {
    return `
      <button class="btn-action-icon btn-fivem-console" data-project-id="${project.id}" title="${t('fivem.serverConsole')}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z"/></svg>
      </button>
      <button class="btn-action-primary btn-fivem-stop" data-project-id="${project.id}" title="${t('fivem.stopServer')}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
      </button>`;
  }
  return `
    <button class="btn-action-primary btn-fivem-start" data-project-id="${project.id}" title="${t('fivem.startServer')}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </button>`;
}

/**
 * Get project icon SVG for FiveM
 * @param {Object} ctx - { project, projectColor }
 * @returns {string} HTML
 */
function getProjectIcon(ctx) {
  const { projectColor } = ctx;
  const iconColorStyle = projectColor ? `style="color: ${projectColor}"` : '';
  return `<svg viewBox="0 0 24 24" fill="currentColor" class="fivem-icon" ${iconColorStyle}><path d="M21 16V4H3v12h18m0-14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7v2h2v2H8v-2h2v-2H3a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h18M5 6h9v5H5V6m10 0h4v2h-4V6m4 3v5h-4V9h4M5 12h4v2H5v-2m5 0h4v2h-4v-2z"/></svg>`;
}

/**
 * Get status indicator dot
 * @param {Object} ctx - { fivemStatus }
 * @returns {string} HTML
 */
function getStatusIndicator(ctx) {
  const { fivemStatus } = ctx;
  const statusText = fivemStatus === 'stopped' ? t('fivem.stopped')
    : fivemStatus === 'starting' ? t('fivem.starting')
    : t('fivem.running');
  return `<span class="fivem-status-dot ${fivemStatus}" title="${statusText}"></span>`;
}

/**
 * Get CSS class for project item
 * @returns {string}
 */
function getProjectItemClass() {
  return 'fivem-project';
}

/**
 * Get additional menu items for the more-actions menu
 * @param {Object} ctx - { project }
 * @returns {string} HTML
 */
function getMenuItems(ctx) {
  const { project } = ctx;
  return `
    <button class="more-actions-item btn-claude" data-project-id="${project.id}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z"/></svg>
      Claude Code
    </button>`;
}

/**
 * Get dashboard project icon for the sidebar list
 * @returns {string} SVG HTML
 */
function getDashboardIcon() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16V4H3v12h18m0-14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7v2h2v2H8v-2h2v-2H3a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h18"/></svg>';
}

/**
 * Bind sidebar event handlers for FiveM buttons
 * @param {HTMLElement} list - The project list container
 * @param {Object} cbs - { onStartFivem, onStopFivem, onOpenFivemConsole }
 */
function bindSidebarEvents(list, cbs) {
  list.querySelectorAll('.btn-fivem-start').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (cbs.onStartFivem) cbs.onStartFivem(btn.dataset.projectId);
    };
  });
  list.querySelectorAll('.btn-fivem-stop').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (cbs.onStopFivem) cbs.onStopFivem(btn.dataset.projectId);
    };
  });
  list.querySelectorAll('.btn-fivem-console').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (cbs.onOpenFivemConsole) cbs.onOpenFivemConsole(btn.dataset.projectId);
    };
  });
}

module.exports = {
  getSidebarButtons,
  getProjectIcon,
  getStatusIndicator,
  getProjectItemClass,
  getMenuItems,
  getDashboardIcon,
  bindSidebarEvents
};
