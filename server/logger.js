const fs = require('fs');
const path = require('path');

const SUPER_ADMIN_LOG_FILE = path.join(__dirname, 'super_admin_activity.log');

/**
 * Logs super-admin activities with phone number and timestamp
 * @param {string} phone - The phone number of the super-admin
 * @param {string} action - The action performed
 * @param {object} details - Additional details about the action
 */
function logSuperAdminActivity(phone, action, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        phone,
        action,
        details
    };

    const logLine = `[${timestamp}] SUPER-ADMIN: ${phone} | ACTION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;

    // Append to log file
    fs.appendFileSync(SUPER_ADMIN_LOG_FILE, logLine, 'utf8');

    // Also log to console for visibility
    console.log(`[SUPER-ADMIN ACTIVITY] ${phone} performed: ${action}`, details);
}

/**
 * Read all super-admin activity logs
 * @returns {string} - The contents of the log file
 */
function readSuperAdminLogs() {
    try {
        if (fs.existsSync(SUPER_ADMIN_LOG_FILE)) {
            return fs.readFileSync(SUPER_ADMIN_LOG_FILE, 'utf8');
        }
        return '';
    } catch (err) {
        console.error('Error reading super-admin logs:', err);
        return '';
    }
}

module.exports = {
    logSuperAdminActivity,
    readSuperAdminLogs
};