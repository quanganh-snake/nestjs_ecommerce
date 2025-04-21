import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);

    response.status(status).json({
      success: false,
      message: exception?.response?.message || exception?.error?.[0]?.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
