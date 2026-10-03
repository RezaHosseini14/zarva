import { ForbiddenException, Injectable } from '@nestjs/common';
import type { IOrgSettingSection } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { UpdateSettingsSectionDto } from './dto/settings.dto';

const SECTIONS = [
  'general',
  'business',
  'invoices',
  'gold',
  'inventory',
  'accounting',
  'tax',
  'notifications',
  'security',
  'language',
  'backup',
] as const;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection(user: IAuthUser, section: string): Promise<IOrgSettingSection> {
    this.assertRead(user);
    if (!(SECTIONS as readonly string[]).includes(section)) {
      return { section, values: {} };
    }
    const row = await this.prisma.orgSetting.findUnique({
      where: {
        organizationId_section: {
          organizationId: user.organizationId,
          section,
        },
      },
    });
    return {
      section,
      values: (row?.values as Record<string, string>) ?? {},
    };
  }

  async putSection(
    user: IAuthUser,
    section: string,
    dto: UpdateSettingsSectionDto,
  ): Promise<IOrgSettingSection> {
    this.assertWrite(user);
    if (!(SECTIONS as readonly string[]).includes(section)) {
      return { section, values: dto.values };
    }
    const row = await this.prisma.orgSetting.upsert({
      where: {
        organizationId_section: {
          organizationId: user.organizationId,
          section,
        },
      },
      create: {
        organizationId: user.organizationId,
        section,
        values: dto.values,
      },
      update: { values: dto.values },
    });
    return {
      section: row.section,
      values: row.values as Record<string, string>,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('settings.read')) {
      throw new ForbiddenException('Missing settings.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('settings.update')) {
      throw new ForbiddenException('Missing settings.update');
    }
  }

  private isAdmin(user: IAuthUser): boolean {
    return (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    );
  }
}
