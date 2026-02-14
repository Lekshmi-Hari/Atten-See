const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Try to get user from database, fall back to decoded ID if offline
            try {
                req.user = await User.findById(decoded.id).select('-password');
            } catch (dbError) {
                // If DB fails, use decoded ID from token
                req.user = { _id: decoded.id, id: decoded.id };
            }

            next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ message: 'Not authorized - Invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized - No token provided' });
    }
};

module.exports = { protect };
