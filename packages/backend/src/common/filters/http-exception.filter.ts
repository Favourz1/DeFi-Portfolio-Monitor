import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "@/common/interfaces/api-response.interface";

/**
 * Global exception filter that standardizes all error responses
 *
 * @remarks
 * Transforms all exceptions into the standardized ApiResponse format
 * with proper HTTP status codes and error messages
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : typeof exceptionResponse === "object" &&
              exceptionResponse !== null &&
              "message" in exceptionResponse &&
              typeof exceptionResponse.message === "string"
            ? exceptionResponse.message
            : "An error occurred";
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    const errorResponse: ApiResponse<null> = {
      error: true,
      message,
      statusCode: status,
      data: null,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
