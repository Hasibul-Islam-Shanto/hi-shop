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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductReviewQueryDto } from './dto/product-review-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(private readonly products: ProductService) {}

  // ─── Public: Product Reads ───────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all products with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated product list' })
  findAll(@Query() query: ProductQueryDto) {
    return this.products.findAll(query);
  }

  @Get('category/:categoryId')
  @Public()
  @ApiOperation({ summary: 'List products by category ID with pagination' })
  @ApiParam({ name: 'categoryId', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Paginated product list for the given category',
  })
  findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.products.findByCategory(categoryId, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Product detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({ name: 'slug', type: String, example: 'classic-white-sneakers' })
  @ApiOkResponse({ description: 'Product detail' })
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get paginated reviews for a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Paginated review list' })
  findReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ProductReviewQueryDto,
  ) {
    return this.products.findReviews(id, query);
  }

  // ─── Admin: Product Writes ───────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: '[Admin] Create a new product with variants and images',
  })
  @ApiCreatedResponse({ description: 'Product created' })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '[Admin] Update a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Product updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }

  // ─── Admin: Variant Management ───────────────────────────────────────────────

  @Post(':id/variants')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '[Admin] Add a variant to a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiCreatedResponse({ description: 'Variant added' })
  addVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.products.addVariant(id, dto);
  }

  @Patch(':id/variants/:variantId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '[Admin] Update a product variant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'variantId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Variant updated' })
  updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.products.updateVariant(id, variantId, dto);
  }

  @Patch(':id/variants/:variantId/inventory')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '[Admin] Adjust product variant inventory' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'variantId', type: String, format: 'uuid' })
  adjustInventory(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.products.adjustInventory(id, variantId, dto, {
      actorId,
      requestId: req.requestId,
      ipAddress: req.ip,
    });
  }

  @Delete(':id/variants/:variantId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Remove a variant from a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'variantId', type: String, format: 'uuid' })
  @ApiNoContentResponse({ description: 'Variant removed' })
  removeVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.products.removeVariant(id, variantId);
  }

  // ─── Admin: Image Management ─────────────────────────────────────────────────

  @Post(':id/images')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '[Admin] Add an image to a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiCreatedResponse({ description: 'Image added' })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.products.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Remove an image from a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'imageId', type: String, format: 'uuid' })
  @ApiNoContentResponse({ description: 'Image removed' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.products.removeImage(id, imageId);
  }
}
