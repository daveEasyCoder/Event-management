import jwt from 'jsonwebtoken';
export const protect = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    console.log(req.user);
    
    next();
  } catch (error) {
    console.error("JWT verify error:", error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};
