import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  getStats() {
    return this.statsService.getStats();
  }
}
