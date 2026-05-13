import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Client-generated key to make checkout retries safe',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;

  @ApiProperty({
    description: 'Address UUID that belongs to the requesting user',
  })
  @IsUUID()
  shippingAddressId: string;

  @ApiPropertyOptional({ example: 'STANDARD', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shippingMethod?: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'At least one item required',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Discount code to apply', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  discountCode?: string;

  @ApiPropertyOptional({
    description: 'Optional delivery notes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
