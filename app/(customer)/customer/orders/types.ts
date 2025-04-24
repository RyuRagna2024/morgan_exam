// app/(customer)/orders/types.ts (or a relevant types file)
import { Prisma, OrderStatus } from "@prisma/client"; // Import Prisma

// --- Define the payload type based on the EXACT includes used in fetch-order.ts ---
// Query: include: { orderItems: { include: { variation: { include: { product: true } } } } }
// Prisma fetches all scalar fields by default with 'true' or nested includes.

const _orderWithDetailsPayload = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    orderItems: {
      include: {
        variation: {
          // Includes all scalar fields from Variation: id, name, color, size, sku, quantity, price, imageUrl, productId
          include: {
            product: true, // Includes all scalar fields from Product: id, productName, productImgUrl, description, sellingPrice, isPublished, createdAt, updatedAt, userId
          },
        },
      },
    },
  },
});

// This is the precise type returned by your Prisma query in fetch-order.ts
export type OrderWithItems = Prisma.OrderGetPayload<
  typeof _orderWithDetailsPayload
>;

// Define the type for a single item within that structure
export type OrderItemWithDetails = OrderWithItems["orderItems"][number];

// Type for the table component props
export interface OrderTableProps {
  orders: OrderWithItems[] | null; // Use the precise type
}

// --- End Accurate Type Definitions ---
