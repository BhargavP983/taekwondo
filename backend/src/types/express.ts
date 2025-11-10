import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface PaginationQuery extends ParsedQs {
  page?: string;
  limit?: string;
}

export interface CadetQuery extends PaginationQuery {
  gender?: 'male' | 'female' | 'other';
  state?: string;
  district?: string;
  status?: string;
}

export type RouteParams = ParamsDictionary & Record<string, string>;

export type EntryParams = RouteParams & {
  entryId: string;
};

export type UserParams = RouteParams & {
  userId: string;
};

export type CadetParams = RouteParams & {
  cadetId: string;
};