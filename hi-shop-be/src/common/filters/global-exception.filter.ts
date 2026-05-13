import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/authenticated-request';

type ErrorResponseBody = {
  error?: string;
  message?: string | string[];
  statusCode?: number;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const responseBody = this.normalizeResponse(exceptionResponse);
    const message =
      responseBody.message ??
      (status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : 'Request failed');

    const payload = {
      success: false,
      statusCode: status,
      error: responseBody.error ?? this.getDefaultError(status),
      message,
      path: request.originalUrl,
      method: request.method,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.originalUrl} ${status} requestId=${request.requestId}`,
        stack,
      );
    }

    response.status(status).json(payload);
  }

  private normalizeResponse(response: unknown): ErrorResponseBody {
    if (typeof response === 'string') {
      return { message: response };
    }
    if (response && typeof response === 'object') {
      return response as ErrorResponseBody;
    }
    return {};
  }

  private getDefaultError(status: number) {
    return HttpStatus[status] ?? 'Error';
  }
}
