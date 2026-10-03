/** Client-safe Nest API error — no next/headers. */

export class NestAuthError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown = null, code: string | null = null) {
    super(message);
    this.name = 'NestAuthError';
    this.status = status;
    this.body = body;
    this.code = code;
  }
}
