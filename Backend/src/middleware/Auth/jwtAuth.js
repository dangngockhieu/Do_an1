import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const jwtAuth = (req, res, next) => {
  try {
    // Lấy token từ header Authorization hoặc cookie
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ EM: 'Access token missing', EC: -1 });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub, 
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ EM: 'Access token expired', EC: -1 });
    }
    return res.status(401).json({ EM: 'Invalid token', EC: -1 });
  }
};
