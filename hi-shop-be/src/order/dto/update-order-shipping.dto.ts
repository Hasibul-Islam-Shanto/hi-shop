import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderShippingDto {
  @ApiPropertyOptional({ example: 'STANDARD' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shippingMethod?: string;

  @ApiPropertyOptional({ example: 'Pathao Courier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  courierName?: string;

  @ApiPropertyOptional({ example: 'TRK-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  shippedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveredAt?: Date;
}
