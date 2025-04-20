// app/(public)/orders/confirmation/[orderId]/page.tsx

import React from "react";
import OrderConfirmation from "./OrderConfirmation";

// Define the params type
interface OrderSuccessPageProps {
  params: {
    orderId: string;
  };
}

// This is a server component that receives params as props
const OrderSuccessPage = ({ params }: OrderSuccessPageProps) => {
  const orderId = params.orderId;

  return (
    <div className="container mx-auto py-10">
      <OrderConfirmation orderId={orderId} />
    </div>
  );
};

export default OrderSuccessPage;
