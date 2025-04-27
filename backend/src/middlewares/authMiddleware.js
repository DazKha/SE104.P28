const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']

    if (!token) {return res.status(401).send({ message: 'No token provided' })}

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
      }
}

module.exports = authMiddleware;