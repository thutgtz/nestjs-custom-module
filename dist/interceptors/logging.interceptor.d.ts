import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomLogger } from '../custom-logger';
export declare class LoggingInterceptor implements NestInterceptor {
    private customLogger;
    constructor(customLogger: CustomLogger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
//# sourceMappingURL=logging.interceptor.d.ts.map