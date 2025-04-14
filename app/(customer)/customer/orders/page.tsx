import React from "react";
import { getCustomerOrders } from "./_action/fetch-order";
import OrderTable from "./_components/OrderTable";

const OrderPage = async () => {
  // Fetch orders data using the server action
  const orderData = await getCustomerOrders();

  return (
    <div>
      <OrderTable orders={orderData} />
    </div>
  );
};

export default OrderPage;
