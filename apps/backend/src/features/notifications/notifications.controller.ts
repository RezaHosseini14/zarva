import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Inbox for current user' })
  list(
    @CurrentUser() user: IAuthUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.notifications.listInbox(user, page, pageSize);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notification count' })
  unreadCount(@CurrentUser() user: IAuthUser) {
    return this.notifications.unreadCount(user);
  }

  @Get('recipients/users')
  @ApiOperation({ summary: 'Users available as notification targets' })
  recipientUsers(
    @CurrentUser() user: IAuthUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.notifications.listRecipientUsers(user, organizationId);
  }

  @Get('recipients/organizations')
  @ApiOperation({ summary: 'Organizations for platform broadcast' })
  recipientOrgs(@CurrentUser() user: IAuthUser) {
    return this.notifications.listOrganizations(user);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Notifications sent by current user' })
  listSent(
    @CurrentUser() user: IAuthUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.notifications.listSent(user, page, pageSize);
  }

  @Get('sent/:id/receipts')
  @ApiOperation({ summary: 'Read receipts for a sent notification (author only)' })
  getReceipts(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notifications.getReceipts(user, id);
  }

  @Get('pending-critical')
  @ApiOperation({ summary: 'Unacknowledged CRITICAL notifications for current user' })
  pendingCritical(@CurrentUser() user: IAuthUser) {
    return this.notifications.listPendingCritical(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create and send a notification' })
  create(@CurrentUser() user: IAuthUser, @Body() dto: CreateNotificationDto) {
    return this.notifications.create(user, dto);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: IAuthUser) {
    return this.notifications.markAllRead(user);
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a CRITICAL notification' })
  acknowledge(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notifications.acknowledge(user, id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one inbox item as read' })
  markRead(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notifications.markRead(user, id);
  }
}
