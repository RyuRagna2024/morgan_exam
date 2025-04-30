// app/(public)/checkout/order-types.ts

import { z } from "zod";
import { orderValidationSchema } from "./order-validations";
// Import Prisma types generated after your schema changes
import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Variation as PrismaVariation,
  Product as PrismaProduct,
  User as PrismaUser, // Optional: if needed
} from "@prisma/client";

/**
 * Type for the data collected in the checkout details form (Step 1),
 * based on the orderValidationSchema.
 */
export type OrderInput = z.infer<typeof orderValidationSchema>;

/**
 * Response type for the `prepareCheckoutSession` server action.
 */
export interface PrepareSessionResult {
  success: boolean;
  error?: string;
  clientSecret?: string | null;
}

/**
 * Type structure for OrderItem including nested relations needed for display,
 * matching the structure returned by Prisma's `include`.
 */
export interface OrderItemWithRelations extends PrismaOrderItem {
  variation: PrismaVariation & {
    product: PrismaProduct; // Expect product nested under variation
  };
}

/**
 * Type structure for Order including nested items and potentially the user,
 * matching the structure returned by Prisma's `include`.
 */
export interface OrderWithRelations extends PrismaOrder {
  orderItems: OrderItemWithRelations[];
  user?: PrismaUser; // Include if you fetch the user relation
}

/**
 * Response type for the `getOrderDetails` server action.
 */
export interface GetOrderDetailsResponse {
  success: boolean;
  order?: OrderWithRelations | null; // Use the specific nested type
  message?: string;
}

/**
 * Response type for the `getOrderStatusByPaymentIntent` server action.
 */
export interface OrderStatusResult {
  success: boolean;
  // Status reflects the state relevant to the polling page
  status: "processing" | "completed" | "failed" | "not_found";
  orderId?: string | null; // The ID of the order in your DB if found
  error?: string;
}

/**
 * Type definition for Cart Items used by your Cart Store/Hook and Order Summary.
 * Ensure this matches the actual structure provided by your cart state management.
 */
export interface CartItem {
  id: string; // Cart item ID
  quantity: number;
  variation: {
    // Nested variation details
    id: string; // Variation ID
    name: string; // e.g., "Large / Red"
    price: number; // Original price of the variation
    imageUrl: string;
    product: {
      // Nested product details
      id: string; // Product ID
      productName: string;
    };
  };
}
