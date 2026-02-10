/**
 * Web App Dashboard hooks
 * Badge and stats for the dashboard
 */

const { getWebAppServer } = require('./WebAppState');

function getDashboardBadge(project) {
  return {
    text: 'Web App',
    cssClass: 'webapp'
  };
}

function getDashboardStats(ctx) {
  const { projectIndex, t } = ctx;
  if (projectIndex === undefined || projectIndex === null) return '';

  const server = getWebAppServer(projectIndex);
  const status = server.status;

  if (status === 'stopped') return '';

  const statusLabel = status === 'running'
    ? (server.port ? `<a href="http://localhost:${server.port}" class="webapp-url-link">localhost:${server.port}</a>` : t('webapp.running'))
    : t('webapp.starting');

  return `
    <div class="dashboard-quick-stat webapp-stat">
      <span class="webapp-status-dot ${status}"></span>
      <span>${t('webapp.devServer')}: ${statusLabel}</span>
    </div>
  `;
}

module.exports = { getDashboardBadge, getDashboardStats };
