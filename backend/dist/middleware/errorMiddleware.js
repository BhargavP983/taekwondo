"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../types/errors");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.statusCode,
            message: err.message,
        });
    }
    // Handle unexpected errors
    console.error('Unexpected error:', err);
    return res.status(500).json({
        success: false,
        status: 500,
        message: 'Something went wrong',
    });
};
exports.errorHandler = errorHandler;
