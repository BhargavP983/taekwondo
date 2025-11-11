"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoleOrSelf = exports.requireRole = exports.authenticateToken = exports.authRateLimiter = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const errors_1 = require("../types/errors");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting for authentication attempts
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});
const authenticateToken = () => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                throw new errors_1.AuthenticationError('No authorization header');
            }
            const [scheme, token] = authHeader.split(' ');
            if (scheme !== 'Bearer' || !token) {
                throw new errors_1.AuthenticationError('Invalid authorization format');
            }
            const payload = (0, jwtUtils_1.verifyToken)(token);
            if (!payload) {
                throw new errors_1.AuthenticationError('Invalid or expired token');
            }
            req.user = payload;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authenticateToken = authenticateToken;
// Normalize legacy snake_case roles to camelCase
const normalizeRole = (role) => {
    switch (role) {
        case 'super_admin': return 'superAdmin';
        case 'state_admin': return 'stateAdmin';
        case 'district_admin': return 'districtAdmin';
        case 'superAdmin':
        case 'stateAdmin':
        case 'districtAdmin':
        case 'user':
            return role;
        default:
            return 'user';
    }
};
const requireRole = (...roles) => {
    return (req, res, next) => {
        try {
            const authReq = req;
            if (!authReq.user) {
                throw new errors_1.AuthenticationError();
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
                throw new errors_1.AuthorizationError(`Required role: ${roles.join(' or ')}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
const requireRoleOrSelf = (...roles) => {
    return (req, res, next) => {
        try {
            const authReq = req;
            if (!authReq.user) {
                throw new errors_1.AuthenticationError();
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
                throw new errors_1.AuthorizationError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRoleOrSelf = requireRoleOrSelf;
