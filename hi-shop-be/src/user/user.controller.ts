import {
  Body,
  Controller,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth('jwt')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser('sub') userId: string) {
    return this.users.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.users.updateMe(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] List users' })
  findAll(@Query() query: AdminUserQueryDto) {
    return this.users.findAllForAdmin(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOneForAdmin(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Change user role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateRole(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.users.updateRole(id, dto.role, {
      actorId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  @Patch(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Suspend user and revoke refresh tokens' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  suspend(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') currentUserId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.users.suspend(id, currentUserId, {
      actorId: currentUserId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Reactivate suspended user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  reactivate(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.users.reactivate(id, {
      actorId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }
}
