/**
 * Format Utilities
 * Helper functions for formatting data for display
 */

/**
 * Format a date to a relative time string
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Relative time string (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'just now';
}

/**
 * Format file size to human readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

/**
 * Format duration in milliseconds to readable string
 * @param {number} ms - Duration in milliseconds
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.showSeconds=false] - Show seconds when duration > 1 min
 * @param {boolean} [options.compact=false] - Compact format without spaces (e.g., "2h30")
 * @param {boolean} [options.alwaysShowMinutes=true] - Show "0m" for sub-minute durations instead of seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms, options = {}) {
  const { showSeconds = false, compact = false, alwaysShowMinutes = true } = options;

  if (!ms || ms < 0) ms = 0;

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const sep = compact ? '' : ' ';

  if (hours > 0) {
    if (minutes > 0) {
      return compact ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h${sep}${minutes}m`;
    }
    return `${hours}h`;
  }

  if (minutes > 0) {
    if (showSeconds && seconds > 0) {
      return `${minutes}m${sep}${seconds}s`;
    }
    return `${minutes}m`;
  }

  // Sub-minute
  if (alwaysShowMinutes) {
    return '0m';
  }
  return seconds > 0 ? `${seconds}s` : '0s';
}

/**
 * Format duration for large hero displays
 * @param {number} ms - Duration in milliseconds
 * @returns {{ hours: number, minutes: number }}
 */
function formatDurationLarge(ms) {
  if (!ms || ms < 0) ms = 0;
  return {
    hours: Math.floor(ms / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000)
  };
}

/**
 * Truncate a string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Truncate a path, keeping the filename visible
 * @param {string} pathStr - Path to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated path
 */
function truncatePath(pathStr, maxLength) {
  if (!pathStr || pathStr.length <= maxLength) return pathStr;

  const parts = pathStr.split(/[/\\]/);
  const filename = parts.pop();

  if (filename.length >= maxLength - 3) {
    return '...' + filename.slice(-maxLength + 3);
  }

  let result = filename;
  for (let i = parts.length - 1; i >= 0; i--) {
    const test = parts[i] + '/' + result;
    if (test.length > maxLength - 3) {
      return '.../' + result;
    }
    result = test;
  }

  return result;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase or snake_case to Title Case
 * @param {string} str - String to convert
 * @returns {string}
 */
function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()
    .split(' ')
    .map(word => capitalize(word.toLowerCase()))
    .join(' ');
}

module.exports = {
  formatRelativeTime,
  formatFileSize,
  formatDuration,
  formatDurationLarge,
  truncate,
  truncatePath,
  capitalize,
  toTitleCase
};
