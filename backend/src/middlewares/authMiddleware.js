const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('🔐 AUTH MIDDLEWARE - Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ NO AUTH HEADER');
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('❌ NO TOKEN IN HEADER');
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('🔑 TOKEN FOUND:', token ? 'Token exists' : 'No token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    // Handle both 'id' and 'userId' properties from different token structures
    req.userId = decoded.userId || decoded.id;
    
    console.log(`✅ AUTH SUCCESS - UserId: ${req.userId}, Decoded:`, decoded);
    next();
  } catch (error) {
    console.error('💥 AUTH ERROR:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};