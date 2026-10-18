import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import {
  CreateSidebarNavItemDto,
  ReorderSidebarNavItemDto,
  UpdateSidebarNavItemDto,
} from '../navigation/dto/navigation.dto';
import { NavigationService } from '../navigation/navigation.service';

@ApiTags('Platform / Navigation')
@ApiBearerAuth()
@Controller('platform/navigation')
export class PlatformNavigationController {
  constructor(private readonly navigation: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Full sidebar catalog (SUPER_ADMIN)' })
  list(@CurrentUser() user: IAuthUser) {
    return this.navigation.listAdmin(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create sidebar nav item (SUPER_ADMIN)' })
  create(@CurrentUser() user: IAuthUser, @Body() dto: CreateSidebarNavItemDto) {
    return this.navigation.create(user, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder / reparent sidebar items (SUPER_ADMIN)' })
  reorder(@CurrentUser() user: IAuthUser, @Body() dto: ReorderSidebarNavItemDto) {
    return this.navigation.reorder(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sidebar nav item (SUPER_ADMIN)' })
  update(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSidebarNavItemDto,
  ) {
    return this.navigation.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sidebar nav item (SUPER_ADMIN)' })
  remove(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.navigation.remove(user, id);
  }
}
