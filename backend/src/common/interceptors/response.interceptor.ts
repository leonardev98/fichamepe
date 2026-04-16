import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type WrappedSuccess<T> = {
  success: true;
  data: T;
  timestamp: string;
};

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WrappedSuccess<unknown>> {
    return next.handle().pipe(
      map((data) => {
        if (context.getType() === 'http') {
          const res = context.switchToHttp().getResponse<Response>();
          if (res.headersSent) {
            return data as WrappedSuccess<unknown>;
          }
        }
        return {
          success: true as const,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
