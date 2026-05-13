import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ example: 25, description: 'New absolute stock value' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Restocked from supplier shipment' })
  @IsString()
  @MaxLength(255)
  note: string;
}
