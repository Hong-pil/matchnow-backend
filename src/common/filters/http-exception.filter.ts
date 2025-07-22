// src/common/filters/http-exception.filter.ts (개선된 버전)
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof SyntaxError && exception.message.includes('JSON')) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid JSON format in request body';
      error = 'JSON_PARSE_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = 'APPLICATION_ERROR';
      
      // 🆕 MongoDB ObjectId 에러 처리
      if (exception.message.includes('ObjectId')) {
        status = HttpStatus.BAD_REQUEST;
        message = '올바르지 않은 ID 형식입니다.';
        error = 'INVALID_OBJECT_ID';
      }
    }

    // 로그 기록 개선
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // 🔧 수정: 일관된 JSON 응답 구조
    const errorResponse = {
      success: false, // 🆕 추가: 프론트엔드에서 사용하는 success 필드
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    response.status(status).json(errorResponse);
  }
}