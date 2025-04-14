import { OrderStatus } from "@prisma/client";

/**
 * Represents an order item with product variation details
 */
export type OrderItemWithDetails = {
  id: string;
  orderId: string;
  variationId: string;
  quantity: number;
  price: number;
  variation: {
    id: string;
    product: {
      id?: string;
      name?: string;
      slug?: string;
      featuredImageUrl?: string;
    };
  };
};

/**
 * Represents an order with related order items
 */
export type OrderWithItems = {
  id: string;
  captivityBranch: string;
  methodOfCollection: string;
  salesRep: string | null;
  referenceNumber: string | null;
  firstName: string;
  lastName: string;
  companyName: string;
  countryRegion: string;
  streetAddress: string;
  apartmentSuite: string | null;
  townCity: string;
  province: string;
  postcode: string;
  phone: string;
  email: string;
  orderNotes: string | null;
  status: OrderStatus;
  totalAmount: number;
  agreeTerms: boolean;
  receiveEmailReviews: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  orderItems: OrderItemWithDetails[];
};

/**
 * Props for the OrderTable component
 */
export interface OrderTableProps {
  orders: OrderWithItems[];
}

/**
 * Props for the OrderDetails component
 */
export interface OrderDetailsProps {
  order: OrderWithItems;
}
