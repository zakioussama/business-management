

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/database.js';
import { createUser, findUserByUsername } from '../models/userModel.js';
import { logAction } from '../utils/auditLogger.js';
import Client from '../models/clientModel.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a JWT for a given user.
 * @param {number} id - The user's ID.
 * @param {string} role - The user's role.
 * @returns {string} The generated JWT.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Handles user registration, with special transactional logic for 'client' role.
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  const { username, password, role = 'client', fullName, phone, email } = req.body;

  // --- Validation ---
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }
  const allowedRoles = ['admin', 'supervisor', 'agent', 'client'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }
  // If registering as a client, we need more details.
  if (role === 'client' && (!fullName || !phone || !email)) {
    return res.status(400).json({ message: 'fullName, phone, and email are required for client registration.' });
  }

  const connection = await pool.getConnection();
  try {
    // Check if username or email is already taken
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken.' });
    }
    // This check is simple; a more robust way would be to query the clients table directly
    if (role === 'client') {
        const [clientRows] = await pool.query('SELECT id FROM clients WHERE email = ?', [email]);
        if (clientRows.length > 0) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }
    }

    await connection.beginTransaction();

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Create user record
    const userResult = await createUser(username, hashedPassword, role, connection);
    const newUserId = userResult.insertId;

    // 3. If role is 'client', also create a client record
    if (role === 'client') {
      await Client.create({
        fullName,
        phone,
        email,
        notes: 'Self-registered client.',
        createdBy: newUserId, // The client user is the creator of their own client profile
        userId: newUserId,   // Link to the users table
        connection
      });
    }
    
    await connection.commit();

    await logAction({
        userId: newUserId,
        action: 'REGISTER_USER',
        entity: 'users',
        entityId: newUserId,
        afterState: { username, role }
    });

    res.status(201).json({
      message: 'User registered successfully.',
      userId: newUserId,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Handles user login.
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }

  try {
    // Find user by username
    const user = await findUserByUsername(username);

    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate token
      const token = generateToken(user.id, user.role);

      await logAction({ userId: user.id, action: 'LOGIN_SUCCESS' });

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } else {
      // Use a generic message to avoid telling attackers which field is wrong
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    next(error);
  }
};
