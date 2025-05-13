import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  constructor(private readonly logger: LoggerService) { }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : exception;

    // Trích xuất message từ nhiều nguồn có thể
    let errorMessage = '';
    let stackTrace: any = null;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      if ('message' in exceptionResponse) {
        errorMessage = (exceptionResponse as any).message;
      } else {
        errorMessage = JSON.stringify(exceptionResponse);
      }
    }

    if (exception instanceof Error) {
      stackTrace = exception.stack;
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception;

    // console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);
    // Ghi log
    this.logger.error({
      message: errorMessage,
      method: request.method,
      path: request.url,
      stack: stackTrace,
      timestamp: new Date().toISOString(),
      exception: JSON.stringify(exception),
    });

    response.status(status).json({
      success: false,
      message: exception?.response?.message || exception?.error?.[0]?.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
