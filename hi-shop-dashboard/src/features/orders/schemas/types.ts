export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productVariant: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  discountId: string | null;
  status: OrderStatus;
  subtotalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  taxAmount?: number;
  totalAmount: number;
  shippingMethod?: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  user: OrderUser;
  items: OrderItem[];
  payment: unknown | null;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface UpdateShippingValues {
  shippingMethod?: string;
  courierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
}
