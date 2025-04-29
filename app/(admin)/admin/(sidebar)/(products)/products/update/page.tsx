// app/(admin)/admin/products/update/page.tsx
import React from "react";
import { getAdminProductList } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/actions";
import ProductListTable from "@/app/(admin)/admin/(sidebar)/(products)/products/update/_components/ProductListTable";

import { Button } from "@/components/ui/button"; // This likely uses alias correctly already
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function UpdateProductListPage() {
  const result = await getAdminProductList({ take: 100 }); // Fetch initial list

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Update Products</h1>
          <p className="text-muted-foreground">
            Edit or delete existing products in your catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Link>
        </Button>
      </div>

      {result.success && result.products ? (
        <ProductListTable products={result.products} />
      ) : (
        <div className="text-center text-destructive p-4 border border-destructive/50 bg-destructive/10 rounded-md">
          {result.error || "Could not load product list."}
        </div>
      )}
    </div>
  );
}
