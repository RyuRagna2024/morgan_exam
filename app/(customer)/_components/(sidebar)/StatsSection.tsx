"use client";

// Define props interface directly in the file
interface StatsSectionProps {
  orderCount: number;
  wishlistCount: number;
}

export default function StatsSection({
  orderCount,
  wishlistCount,
}: StatsSectionProps) {
  return (
    <div className="flex border-b border-slate-600">
      <div className="flex-1 py-4 text-center border-r border-slate-600">
        <p className="text-2xl font-bold">{orderCount}</p>
        <p className="text-sm text-slate-300">Orders</p>
      </div>
      <div className="flex-1 py-4 text-center">
        <p className="text-2xl font-bold">{wishlistCount}</p>
        <p className="text-sm text-slate-300">Wishlist</p>
      </div>
    </div>
  );
}
