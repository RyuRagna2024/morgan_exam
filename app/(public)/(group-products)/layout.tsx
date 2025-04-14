// app/(public)/(group-products)/layout.tsx
"use client";

import { useEffect, useRef } from "react";
import FilterSidebar from "./_components/(filterside)/FilterSidebar";
import { useProductStore } from "./_components/_store/product-store";

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize product store on layout mount
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch products once when the layout first mounts
    if (!hasInitialized.current) {
      fetchProducts();
      hasInitialized.current = true;
    }
  }, [fetchProducts]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-28">
      <div className="flex gap-x-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <FilterSidebar />
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <div className="lg:hidden">
        <FilterSidebar />
      </div>
    </div>
  );
}
