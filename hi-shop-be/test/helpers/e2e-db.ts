import { PrismaService } from '../../src/prisma/prisma.service';
import { assertSafeE2eDatabase } from './e2e-config';

export async function resetE2eDatabase(prisma: PrismaService) {
  assertSafeE2eDatabase();

  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderStatusLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.user.deleteMany();
}
