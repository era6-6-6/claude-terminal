/**
 * FiveM Dashboard Module
 * Provides dashboard badge and quick stats for FiveM projects
 */

const { t } = require('../../../renderer/i18n');

/**
 * Get dashboard type badge
 * @param {Object} project
 * @returns {Object|null} { text, cssClass }
 */
function getDashboardBadge(project) {
  return {
    text: t('dashboard.fivemServer'),
    cssClass: 'fivem'
  };
}

/**
 * Get dashboard quick stat HTML for FiveM server status
 * @param {Object} ctx - { fivemStatus }
 * @returns {string} HTML
 */
function getDashboardStats(ctx) {
  const { fivemStatus } = ctx;
  const statusText = fivemStatus === 'running' ? t('fivem.online')
    : fivemStatus === 'starting' ? t('fivem.starting')
    : t('fivem.stopped');

  return `
    <div class="quick-stat ${fivemStatus}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16V4H3v12h18m0-14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7v2h2v2H8v-2h2v-2H3a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h18"/></svg>
      <span>${statusText}</span>
    </div>
  `;
}

module.exports = {
  getDashboardBadge,
  getDashboardStats
};
