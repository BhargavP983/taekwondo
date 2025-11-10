import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../types/errors';
import { TypedRequestHandler } from '../types/handlers';

type ValidationSchema = {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
};

export const validateRequest = <
  T extends ValidationSchema,
  P = T['params'] extends z.ZodType<any> ? z.infer<T['params']> : any,
  ResBody = any,
  ReqBody = T['body'] extends z.ZodType<any> ? z.infer<T['body']> : any,
  ReqQuery = T['query'] extends z.ZodType<any> ? z.infer<T['query']> : any
>(schemas: T): TypedRequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    try {
      const validData: Partial<{
        body: ReqBody;
        query: ReqQuery;
        params: P;
      }> = {};

      if (schemas.body) {
        validData.body = await schemas.body.parseAsync(req.body) as ReqBody;
      }
      if (schemas.query) {
        validData.query = await schemas.query.parseAsync(req.query) as ReqQuery;
      }
      if (schemas.params) {
        validData.params = await schemas.params.parseAsync(req.params) as P;
      }

      // Update request with validated data
      if (validData.body) req.body = validData.body;
      if (validData.query) req.query = validData.query;
      if (validData.params) req.params = validData.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error.issues.map((e) => e.message).join(', ')));
      } else {
        next(error);
      }
    }
  };
};