import { NextFunction, Request, Response } from 'express';
import { ApiError } from './errors/api-error';
import { v4 as uuidV4 } from 'uuid';

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.isAuthenticated()) {
        return next(new ApiError('unauthorized', 401));
    }

    next();
}

export function attachRequestUIDMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    req.requestUID! = uuidV4();

    next();
}
