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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('addresses')
@ApiBearerAuth('jwt')
@Controller({ path: 'addresses', version: '1' })
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: "List current user's addresses" })
  list(@CurrentUser('sub') userId: string) {
    return this.addressService.list(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an address (blocked if it has linked orders)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressService.remove(userId, id);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  setDefault(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressService.setDefault(userId, id);
  }
}
