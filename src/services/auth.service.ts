import { query } from '../db/index.js';
import { hashPassword, verifyPassword } from '../utils/encryption.js';
import { generateToken, generateRefreshToken, verifyToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function register(data: RegisterData) {
  const { email, password, fullName, companyName } = data;
  
  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  
  if (existingUser.rows.length > 0) {
    throw new AppError(409, 'Email already registered');
  }
  
  // Hash password
  const passwordHash = hashPassword(password);
  
  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, company_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, company_name, subscription_tier, created_at`,
    [email, passwordHash, fullName, companyName]
  );
  
  const user = result.rows[0];
  
  // Generate tokens
  const token = generateToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscription_tier,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscription_tier,
  });
  
  logger.info('User registered', { userId: user.id, email: user.email });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      companyName: user.company_name,
      subscriptionTier: user.subscription_tier,
      createdAt: user.created_at,
    },
    token,
    refreshToken,
  };
}

export async function login(data: LoginData) {
  const { email, password } = data;
  
  // Get user
  const result = await query(
    `SELECT id, email, password_hash, full_name, company_name, subscription_tier, is_active
     FROM users WHERE email = $1`,
    [email]
  );
  
  if (result.rows.length === 0) {
    throw new AppError(401, 'Invalid email or password');
  }
  
  const user = result.rows[0];
  
  // Check if user is active
  if (!user.is_active) {
    throw new AppError(403, 'Account is disabled');
  }
  
  // Verify password
  const isValidPassword = verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new AppError(401, 'Invalid email or password');
  }
  
  // Update last login
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );
  
  // Generate tokens
  const token = generateToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscription_tier,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscription_tier,
  });
  
  logger.info('User logged in', { userId: user.id, email: user.email });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      companyName: user.company_name,
      subscriptionTier: user.subscription_tier,
    },
    token,
    refreshToken,
  };
}

export async function refreshToken(oldRefreshToken: string) {
  try {
    const decoded = verifyToken(oldRefreshToken);
    
    // Get updated user info
    const result = await query(
      `SELECT id, email, subscription_tier, is_active
       FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      throw new AppError(401, 'User not found');
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      throw new AppError(403, 'Account is disabled');
    }
    
    // Generate new tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });
    
    return { token, refreshToken };
  } catch (error) {
    throw new AppError(401, 'Invalid refresh token');
  }
}

export async function getCurrentUser(userId: string) {
  const result = await query(
    `SELECT id, email, full_name, company_name, subscription_tier, created_at, last_login_at
     FROM users WHERE id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new AppError(404, 'User not found');
  }
  
  return result.rows[0];
}

