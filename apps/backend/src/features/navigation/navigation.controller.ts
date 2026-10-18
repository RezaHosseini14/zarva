import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { NavigationService } from './navigation.service';

@ApiTags('Navigation')
@ApiBearerAuth()
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigation: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Sidebar nav tree for current user (role/permission filtered)' })
  getForUser(@CurrentUser() user: IAuthUser) {
    return this.navigation.getForUser(user);
  }
}
