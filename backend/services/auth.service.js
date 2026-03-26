/**
 * Auth Service - Business logic for authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

const ACCESS_TOKEN_EXPIRY = '6h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Register new user
 */
exports.register = async (userData) => {
  const { name, email, password, role = 'staff' } = userData;

  // Check if email already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const userId = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  const user = await UserModel.findById(userId);

  return {
    success: true,
    message: 'User registered successfully',
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  };
};

/**
 * Login user
 */
exports.login = async (email, password) => {
  // Find user
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password',
      status: 401
    };
  }

  // Check if user is active
  if (!user.is_active) {
    return {
      success: false,
      message: 'Account is disabled. Please contact administrator.',
      status: 403
    };
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return {
      success: false,
      message: 'Invalid email or password',
      status: 401
    };
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in database
  await UserModel.updateRefreshToken(user.id, refreshToken);

  // Return user data without password
  return {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  };
};

/**
 * Logout user
 */
exports.logout = async (userId) => {
  await UserModel.clearRefreshToken(userId);
  
  return {
    success: true,
    message: 'Logout successful'
  };
};

/**
 * Refresh token
 */
exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return {
      success: false,
      message: 'Refresh token is required',
      status: 400
    };
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Find user by refresh token
    const user = await UserModel.findByRefreshToken(refreshToken);
    if (!user || user.id !== decoded.id) {
      return {
        success: false,
        message: 'Invalid refresh token',
        status: 401
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Account is disabled',
        status: 403
      };
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in database
    await UserModel.updateRefreshToken(user.id, newRefreshToken);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Invalid or expired refresh token',
      status: 401
    };
  }
};

/**
 * Get current user
 */
exports.getMe = async (userId) => {
  const user = await UserModel.findById(userId);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found',
      status: 404
    };
  }

  return {
    success: true,
    data: { user }
  };
};
