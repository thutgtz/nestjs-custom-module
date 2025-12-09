import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { CustomLogger } from '../custom-logger'
import { CustomResponse } from './models/custom-response.model'
import { FastifyRequest, FastifyReply } from 'fastify'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private customLogger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const request = http.getRequest<FastifyRequest>()
    const response = http.getResponse<FastifyReply>()

    return next
      .handle()
      .pipe(
        tap((data: CustomResponse<any>) =>
          this.customLogger.logApiRequestResponse(request, data.status, response.statusCode, data)
        )
      )
  }
}
