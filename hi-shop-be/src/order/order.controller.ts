import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
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
import {
  AuthenticatedRequest,
  JwtPayload,
} from '../common/types/authenticated-request';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderShippingDto } from './dto/update-order-shipping.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@ApiBearerAuth('jwt')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ─── Customer routes ───────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'List own orders' })
  findMyOrders(@CurrentUser() user: JwtPayload, @Query() query: OrderQueryDto) {
    return this.orderService.findMyOrders(user.sub, query);
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Get a single own order' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findMyOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.findMyOrder(user.sub, id);
  }

  @Delete('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel own order (PENDING / CONFIRMED / PROCESSING only)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  cancelMyOrder(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.cancelMyOrder(user.sub, id, {
      actorId: user.sub,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  // ─── Admin routes ──────────────────────────────────────────────────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin — list all orders with optional status filter',
  })
  findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin — get order by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin — advance or cancel order status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto, {
      actorId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  @Patch(':id/shipping')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin — update order shipping details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateShipping(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderShippingDto,
  ) {
    return this.orderService.updateShipping(id, dto, {
      actorId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  @Get(':id/status-logs')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin — full status-change audit trail for an order',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findStatusLogs(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findStatusLogs(id);
  }
}
