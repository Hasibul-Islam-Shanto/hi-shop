import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'ProductVariant UUID' })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ description: 'Number of units', minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
