import { RouteParams } from './express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface UserParams extends ParamsDictionary {
    userId: string;
}

export interface StateAdminParams extends ParamsDictionary {
    stateId: string;
}

export interface DistrictAdminParams extends ParamsDictionary {
    districtId: string;
}

export type WithUserIdParam<P = ParamsDictionary> = P & { userId: string };