import pool from '../config/database.js';

/**
 * Logs an action to the audit log table.
 * @param {object} logData
 * @param {number} logData.userId - The ID of the user performing the action.
 * @param {string} logData.action - A short description of the action (e.g., 'CREATE_CLIENT').
 * @param {string} [logData.entity] - The name of the entity being changed (e.g., 'clients').
 * @param {number} [logData.entityId] - The ID of the entity being changed.
 * @param {object} [logData.beforeState] - The state of the entity before the change (for updates).
 * @param {object} [logData.afterState] - The state of the entity after the change.
 */
export const logAction = async ({ userId, action, entity, entityId, beforeState, afterState }) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_state, after_state) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        action,
        entity,
        entityId,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
      ]
    );
  } catch (error) {
    // Log the error but don't let a logging failure crash the main application flow.
    console.error('CRITICAL: Failed to write to audit log:', error.message);
  }
};
