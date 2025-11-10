"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asHandler = void 0;
const asHandler = (handler) => {
    return async (req, res, next) => {
        try {
            const result = await handler(req, res, next);
            if (result !== undefined && !res.headersSent) {
                return result;
            }
        }
        catch (error) {
            next(error);
        }
    };
};
exports.asHandler = asHandler;
