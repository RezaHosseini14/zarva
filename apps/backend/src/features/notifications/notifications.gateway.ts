import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
  IAuthSessionRevokedEvent,
  INotificationInboxItem,
  INotificationReadEvent,
} from '@zarva/shared';
import type { Server, Socket } from 'socket.io';

import type { IJwtPayload } from '../auth/auth.types';

function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3100',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token || !looksLikeJwt(token)) {
        client.disconnect(true);
        return;
      }
      const payload = await this.jwt.verifyAsync<IJwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      await client.join(`user:${payload.sub}`);
      if (payload.familyId) {
        await client.join(`family:${payload.familyId}`);
        client.data.familyId = payload.familyId;
      }
      client.data.userId = payload.sub;
    } catch (error) {
      this.logger.warn(`WS auth failed: ${error instanceof Error ? error.message : 'unknown'}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.logger.debug(`WS disconnect user:${userId}`);
    }
  }

  emitToUser(userId: string, payload: INotificationInboxItem): void {
    this.safeEmitToUser(userId, 'notification.created', payload);
  }

  emitAuthEvent(userId: string, event: string, payload: unknown): void {
    this.safeEmitToUser(userId, event, payload);
  }

  /** Kick every socket in this session family immediately after revoke. */
  emitSessionRevoked(userId: string, payload: IAuthSessionRevokedEvent): void {
    try {
      if (!this.server) {
        this.logger.warn('WS server not ready; skip session revoke emit');
        return;
      }
      this.server.to(`user:${userId}`).emit('auth.session.revoked', payload);
      this.server.to(`family:${payload.familyId}`).emit('auth.session.revoked', payload);
      // Let the revoke event flush, then drop family sockets so the tab cannot linger.
      setTimeout(() => {
        void this.server.in(`family:${payload.familyId}`).disconnectSockets(true);
      }, 80);
    } catch (error) {
      this.logger.warn(
        `WS session revoke emit failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  emitReadToAuthor(authorId: string, payload: INotificationReadEvent): void {
    this.safeEmitToUser(authorId, 'notification.read', payload);
  }

  private safeEmitToUser(userId: string, event: string, payload: unknown): void {
    try {
      if (!this.server) {
        this.logger.warn('WS server not ready; skip realtime emit');
        return;
      }
      this.server.to(`user:${userId}`).emit(event, payload);
    } catch (error) {
      this.logger.warn(
        `WS emit failed for user:${userId}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = this.handshakeAuthToken(client);
    if (authToken) return authToken;
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }
    return null;
  }

  private handshakeAuthToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }
    return null;
  }
}
