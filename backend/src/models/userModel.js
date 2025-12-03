import pool from '../config/database.js';

/**
 * Creates a new user in the database.
 * @param {string} username - The user's username.
 * @param {string} hashedPassword - The user's hashed password.
 * @param {string} role - The user's role ('admin', 'supervisor', 'agent', 'client').
 * @returns {Promise<object>} The result from the database query.
 */
export const createUser = async (username, hashedPassword, role, connection) => {
  const queryable = connection || pool;
  const [result] = await queryable.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role]
  );
  return result;
};

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

/**
 * Finds a user by their ID.
 * @param {number} id - The ID of the user to find.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
export const findUserById = async (id) => {
    const [rows] = await pool.query(
        'SELECT id, username, role, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};
