const { verifyToken, getMerchantById } = require('../services/authService');
const { sendError } = require('../utils/response');

// JWT authentication middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'No token provided', 'INVALID_TOKEN', 401);
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return sendError(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
  }
  
  // Get merchant from database
  const merchant = getMerchantById(decoded.id);
  
  if (!merchant) {
    return sendError(res, 'Merchant not found', 'UNAUTHORIZED', 401);
  }
  
  // Attach merchant to request
  req.merchant = merchant;
  next();
}

module.exports = { authMiddleware };
