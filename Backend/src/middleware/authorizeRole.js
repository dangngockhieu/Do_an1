export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    try {
      // Kiểm tra đã xác thực JWT chưa
      if (!req.user) {
        return res.status(401).json({ EM: 'Unauthorized', EC: -1 });
      }

      // Kiểm tra vai trò người dùng có hợp lệ không
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ EM: 'Forbidden: insufficient role', EC: -1 });
      }

      // Nếu hợp lệ => đi tiếp
      next();
    } catch (err) {
      console.error('Role authorization error:', err);
      return res.status(500).json({ EM: 'Server Internal Error', EC: -1 });
    }
  };
};
