/**
 * Web App Wizard hooks
 * Custom fields for project creation
 */

function getWizardFields() {
  return `
    <div class="webapp-config" style="display:none;">
      <div class="form-group">
        <label data-i18n="newProject.devCommand">Dev command</label>
        <input type="text" id="webapp-dev-command" placeholder="npm run dev" class="form-input" />
        <small style="color: var(--text-secondary); margin-top: 4px; display: block;">
          Leave empty to auto-detect from package.json
        </small>
      </div>
    </div>
  `;
}

function onWizardTypeSelected(form, isSelected) {
  const config = form.querySelector('.webapp-config');
  if (config) {
    config.style.display = isSelected ? 'block' : 'none';
  }
}

function bindWizardEvents(form, api) {
  // No special events needed for webapp wizard
}

function getWizardConfig(form) {
  const devCommand = form.querySelector('#webapp-dev-command')?.value?.trim() || '';
  return {
    devCommand: devCommand || undefined
  };
}

module.exports = { getWizardFields, onWizardTypeSelected, bindWizardEvents, getWizardConfig };
