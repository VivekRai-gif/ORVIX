import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'orvix_super_secret_jwt_key_2026';

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Allow open access in dev/demo mode if no token, or attach user if token present
  if (!token) {
    req.user = { id: 'usr_guest', name: 'Guest Merchant', role: 'merchant' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Invalid or expired token.'
    });
  }
};
