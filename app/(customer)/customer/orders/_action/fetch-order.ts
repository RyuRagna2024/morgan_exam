"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

/**
 * Fetches all orders for the currently authenticated customer
 * @returns List of customer orders
 */
export async function getCustomerOrders() {
  // Validate that user is authenticated
  const { user, session } = await validateRequest();

  // If no valid session or user, throw an error
  if (!session || user.role !== "CUSTOMER") {
    throw new Error("Unauthorized: You must be logged in to view orders");
  }

  try {
    // Get all orders for the current user
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw new Error("Failed to fetch orders. Please try again later.");
  }
}

/**
 * Fetches a single order by ID, ensuring the requester is the order owner
 * @param orderId The UUID of the order to fetch
 * @returns The order details or null if not found/unauthorized
 */
export async function getCustomerOrderById(orderId: string) {
  // Validate that user is authenticated
  const { user, session } = await validateRequest();

  // If no valid session or user, throw an error
  if (!session || user.role !== "CUSTOMER") {
    throw new Error(
      "Unauthorized: You must be logged in to view order details",
    );
  }

  try {
    // Get the specific order, ensuring it belongs to the logged-in user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id, // This ensures user can only access their own orders
      },
      include: {
        orderItems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return null; // Order not found or doesn't belong to this user
    }

    return order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw new Error("Failed to fetch order details. Please try again later.");
  }
}
