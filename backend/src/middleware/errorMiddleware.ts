import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
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