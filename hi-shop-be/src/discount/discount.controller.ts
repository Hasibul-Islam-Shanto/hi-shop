import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { DiscountQueryDto } from './dto/discount-query.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountService } from './discount.service';

@ApiTags('discounts')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller({ path: 'discounts', version: '1' })
export class DiscountController {
  constructor(private readonly discounts: DiscountService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create discount' })
  create(@Body() dto: CreateDiscountDto) {
    return this.discounts.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List discounts' })
  findAll(@Query() query: DiscountQueryDto) {
    return this.discounts.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get discount by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discounts.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update discount' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDiscountDto) {
    return this.discounts.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Deactivate discount' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.discounts.deactivate(id);
  }
}
