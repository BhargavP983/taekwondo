import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { RouteParams } from './express';
import { AuthRequest } from '../middleware/authMiddleware';

export type Handler<
  P = RouteParams,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void | Response<ResBody>> | void | Response<ResBody>;

export type AuthHandler<
  P = RouteParams,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: AuthRequest<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void | Response<ResBody>> | void | Response<ResBody>;

export const asHandler = <P = RouteParams, ResBody = any, ReqBody = any, ReqQuery = any>(
  handler: Handler<P, ResBody, ReqBody, ReqQuery> | AuthHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (req, res, next) => {
    try {
      const result = await handler(
        req as any, 
        res as Response<ResBody>, 
        next
      );
      if (result !== undefined && !res.headersSent) {
        return result;
      }
    } catch (error) {
      next(error);
    }
  };
};

export type TypedRequestHandler<P = RouteParams, ResBody = any, ReqBody = any, ReqQuery = any> = 
  RequestHandler<P, ResBody, ReqBody, ReqQuery>;

export type AuthRequestHandler<P = RouteParams, ResBody = any, ReqBody = any, ReqQuery = any> = 
  (req: AuthRequest<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<void | Response<ResBody>> | void | Response<ResBody>;

export type AsyncHandler<P = RouteParams, ResBody = any, ReqBody = any, ReqQuery = any> = 
  (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<void | Response<ResBody>>;