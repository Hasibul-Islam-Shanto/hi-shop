import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must use uppercase letters, numbers, underscores, or hyphens',
  })
  code: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @ValidateIf((dto: CreateDiscountDto) => dto.discountAmt === undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  @Type(() => Number)
  discountPct?: number;

  @ApiPropertyOptional({ example: 100 })
  @ValidateIf((dto: CreateDiscountDto) => dto.discountPct === undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  discountAmt?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  minOrderAmt?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
