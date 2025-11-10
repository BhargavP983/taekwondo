import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AuthenticationError, AuthorizationError } from '../types/errors';
import { JWTPayload, AuthenticatedRequest } from '../types/jwt';
import { RouteParams } from '../types/express';
import rateLimit from 'express-rate-limit';
import { ParamsDictionary } from 'express-serve-static-core';

export type AuthRequest<
  P = RouteParams,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = AuthenticatedRequest<Request<P, ResBody, ReqBody, ReqQuery>>;

// Rate limiting for authentication attempts
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});

export const authenticateToken = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers['authorization'];
      
      if (!authHeader) {
        throw new AuthenticationError('No authorization header');
      }

      const [scheme, token] = authHeader.split(' ');
      
      if (scheme !== 'Bearer' || !token) {
        throw new AuthenticationError('Invalid authorization format');
      }

      const payload = verifyToken(token);
      
      if (!payload) {
        throw new AuthenticationError('Invalid or expired token');
      }

      (req as AuthenticatedRequest<typeof req>).user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Normalize legacy snake_case roles to camelCase
const normalizeRole = (role: string): 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user' => {
  switch (role) {
    case 'super_admin': return 'superAdmin';
    case 'state_admin': return 'stateAdmin';
    case 'district_admin': return 'districtAdmin';
    case 'superAdmin':
    case 'stateAdmin':
    case 'districtAdmin':
    case 'user':
      return role as any;
    default:
      return 'user';
  }
};

export const requireRole = <
  P = RouteParams,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(...roles: string[]) => {
  return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest<P, ResBody, ReqBody, ReqQuery>;
      if (!authReq.user) {
        throw new AuthenticationError();
      }
      const userRole = normalizeRole(authReq.user.role);
      const allowed = roles.map(normalizeRole);
      console.log('[auth] requireRole check:', {
        path: req.path,
        userId: authReq.user.userId,
        incomingRole: authReq.user.role,
        normalizedRole: userRole,
        allowedRoles: allowed
      });

      if (!allowed.includes(userRole)) {
        throw new AuthorizationError(`Required role: ${roles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRoleOrSelf = <
  P extends { userId: string } = { userId: string },
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(...roles: string[]) => {
  return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest<P, ResBody, ReqBody, ReqQuery>;
      if (!authReq.user) {
        throw new AuthenticationError();
      }
      const userRole = normalizeRole(authReq.user.role);
      const allowed = roles.map(normalizeRole);
      const hasRequiredRole = allowed.includes(userRole);
      const isSelfAccess = authReq.user.userId === authReq.params.userId;
      console.log('[auth] requireRoleOrSelf check:', {
        path: req.path,
        userId: authReq.user.userId,
        targetUserId: authReq.params.userId,
        incomingRole: authReq.user.role,
        normalizedRole: userRole,
        allowedRoles: allowed,
        hasRequiredRole,
        isSelfAccess
      });

      if (!hasRequiredRole && !isSelfAccess) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
