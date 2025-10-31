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
    req.user = decoded; 

    next(); 
  } catch (err) {
    console.error('JWT Auth Error:', err.message);
    return res.status(403).json({ EM: 'Invalid or expired token', EC: -1 });
  }
};
