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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@ApiTags('reviews')
@ApiBearerAuth('jwt')
@Controller({ path: 'reviews', version: '1' })
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create own review for a verified purchase' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviews.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateMine(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviews.updateMine(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  removeMine(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviews.removeMine(userId, id);
  }

  @Patch(':id/moderation')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Show or hide a review' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  moderate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateReviewDto) {
    return this.reviews.moderate(id, dto);
  }

  @Public()
  @Get('products/:productId/summary')
  @ApiOperation({ summary: 'Get product review summary' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  summary(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviews.summary(productId);
  }
}
