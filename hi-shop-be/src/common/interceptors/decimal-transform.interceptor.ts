import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function isPrismaDecimal(value: unknown): value is { toNumber(): number } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>)['toNumber'] === 'function' &&
    's' in value &&
    'e' in value &&
    'd' in value
  );
}

function transformDecimals(value: unknown): unknown {
  if (isPrismaDecimal(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(transformDecimals);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, transformDecimals(v)]),
    );
  }
  return value;
}

@Injectable()
export class DecimalTransformInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(transformDecimals));
  }
}
