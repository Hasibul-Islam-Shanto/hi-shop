import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ModerateReviewDto {
  @ApiProperty()
  @IsBoolean()
  isVisible: boolean;
}
