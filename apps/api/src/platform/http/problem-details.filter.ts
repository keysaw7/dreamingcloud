import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  code?: string;
}

interface HttpRequest {
  readonly url: string;
}

interface HttpReply {
  status(statusCode: number): HttpReply;
  type(contentType: string): HttpReply;
  send(payload: ProblemDetails): void;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<HttpReply>();
    const request = context.getRequest<HttpRequest>();

    if (exception instanceof ZodError) {
      const problem: ProblemDetails = {
        type: 'https://api.dreamingcloud.app/problems/400',
        title: 'Bad Request',
        status: 400,
        instance: request.url,
        detail: 'Validation des entrées échouée.',
        code: 'validation_error',
      };
      response.status(400).type('application/problem+json').send(problem);
      return;
    }

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const detail =
      typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
        ? String(exceptionResponse.message)
        : exception instanceof HttpException && exception instanceof Error
          ? exception.message
          : status >= 500
            ? 'Une erreur interne est survenue.'
            : exception instanceof Error
              ? exception.message
              : undefined;

    const problem: ProblemDetails = {
      type: `https://api.dreamingcloud.app/problems/${status}`,
      title: HttpStatus[status] ?? 'Internal Server Error',
      status,
      instance: request.url,
      ...(detail ? { detail } : {}),
    };

    response.status(status).type('application/problem+json').send(problem);
  }
}
