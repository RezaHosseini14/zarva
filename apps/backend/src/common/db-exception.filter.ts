import {
  Catch,
  HttpException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { ArgumentsHost } from '@nestjs/common';

function isDbConnectivityError(err: unknown): boolean {
  if (!(err instanceof Error) || err instanceof HttpException) return false;
  const msg = err.message.toLowerCase();
  const cause =
    'cause' in err && err.cause instanceof Error
      ? err.cause.message.toLowerCase()
      : '';
  const hay = `${msg} ${cause}`;
  return (
    hay.includes('connection terminated') ||
    hay.includes('connection timeout') ||
    hay.includes('econnrefused') ||
    hay.includes('econnreset') ||
    hay.includes('timeout exceeded when trying to connect') ||
    hay.includes('cannot acquire a connection') ||
    hay.includes('server closed the connection')
  );
}

@Catch()
export class DbExceptionFilter extends BaseExceptionFilter {
  private readonly log = new Logger(DbExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (isDbConnectivityError(exception)) {
      this.log.warn(
        `Database unavailable: ${exception instanceof Error ? exception.message : 'error'}`,
      );
      super.catch(
        new ServiceUnavailableException('Database temporarily unavailable'),
        host,
      );
      return;
    }
    super.catch(exception, host);
  }
}
