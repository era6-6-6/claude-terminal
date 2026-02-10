/**
 * General (Standalone) Project Type
 * Minimal type - inherits all defaults from base-type.
 */

const { createType } = require('../base-type');

module.exports = createType({
  id: 'standalone',
  nameKey: 'newProject.types.standalone',
  descKey: 'newProject.types.standaloneDesc',
  category: 'general',
  icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z"/></svg>'
});
