import { randomUUID } from 'node:crypto';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/authenticated-request';

export function requestIdMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const incomingRequestId = req.header('x-request-id')?.trim();
  const requestId = incomingRequestId || randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
