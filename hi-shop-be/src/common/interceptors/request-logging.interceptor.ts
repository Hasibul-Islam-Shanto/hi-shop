import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { catchError, finalize, throwError } from 'rxjs';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    let caughtError: unknown;

    return next.handle().pipe(
      catchError((error: unknown) => {
        caughtError = error;
        return throwError(() => error);
      }),
      finalize(() => {
        const durationMs = Date.now() - startedAt;
        // finalize runs before the GlobalExceptionFilter sets response.statusCode,
        // so when an error was thrown we must derive the real status from the error.
        const statusCode = caughtError
          ? caughtError instanceof HttpException
            ? caughtError.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR
          : response.statusCode;
        const logPayload = {
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode,
          durationMs,
          userId: request.user?.sub,
          ip: request.ip,
          userAgent: request.header('user-agent'),
        };

        const message = JSON.stringify(logPayload);
        if (caughtError || statusCode >= 500) {
          this.logger.error(message);
          return;
        }

        if (statusCode >= 400) {
          this.logger.warn(message);
          return;
        }

        this.logger.log(message);
      }),
    );
  }
}
