import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwtUtils';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  req.user = payload;
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
