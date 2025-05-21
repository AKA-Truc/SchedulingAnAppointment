import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((res) => {
        const statusCode = response.statusCode;

        return {
          message: res?.message || 'Request successfully handled',
          code: statusCode,
          data: res?.data !== undefined ? res.data : res,
          ...(res?.meta && { meta: res.meta }),
        };
      }),
    );
  }
}
