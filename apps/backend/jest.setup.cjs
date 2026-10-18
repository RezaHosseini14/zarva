class HttpException extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
  ConfigModule: { forRoot: () => ({ module: class ConfigModule {} }) },
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {
    sign() {
      return 'token';
    }
    verify() {
      return {};
    }
  },
  JwtModule: {
    register: () => ({ module: class JwtModule {} }),
    registerAsync: () => ({ module: class JwtModule {} }),
  },
}));

jest.mock('@nestjs/common', () => ({
  Injectable: () => (target) => target,
  ForbiddenException: class ForbiddenException extends HttpException {
    constructor(message) {
      super(message ?? 'Forbidden', 403);
    }
  },
  NotFoundException: class NotFoundException extends HttpException {
    constructor(message) {
      super(message ?? 'Not Found', 404);
    }
  },
  BadRequestException: class BadRequestException extends HttpException {
    constructor(message) {
      super(message ?? 'Bad Request', 400);
    }
  },
  ConflictException: class ConflictException extends HttpException {
    constructor(message) {
      super(message ?? 'Conflict', 409);
    }
  },
  UnauthorizedException: class UnauthorizedException extends HttpException {
    constructor(message) {
      super(message ?? 'Unauthorized', 401);
    }
  },
  HttpException,
  HttpStatus: {
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
  },
}));
