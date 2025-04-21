// app/(public)/_components/(section-3)/_components/ProductCard.tsx
import React from "react";
import Image from "next/image";
import { Package, Star, Pencil, Trash2 } from "lucide-react";
// --- Import the UNION type directly ---
import {
  ProductCardProps as ImportedProductCardProps, // Import the union type with an alias
  BaseProductProps, // Import Base if needed for callbacks, though passing the whole item might be simpler
  RegularProductProps, // Import specific types for type guards
  SaleProductProps, // Import specific types for type guards
} from "../types"; // Adjust path if needed
import { cn } from "@/lib/utils";

// --- Define the props for THIS component using an intersection ---
// It accepts the imported union type AND the extra editor props
type ProductCardComponentProps = ImportedProductCardProps & {
  userRole?: string; // Role of the currently viewing user
  onEdit?: (item: ImportedProductCardProps) => void; // Callback for edit, passes item data matching the union type
  onDelete?: (item: ImportedProductCardProps) => void; // Callback for delete, passes item data matching the union type
};
// --- End of type definition ---

// Use the new intersected type for the component's props
const ProductCard: React.FC<ProductCardComponentProps> = (props) => {
  // --- Destructure directly from props, types are now correctly inferred ---
  const { id, name, rating, image, userRole, onEdit, onDelete } = props;

  const isEditor = userRole === "EDITOR";

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      // Pass the entire 'props' object back up.
      // Since props matches ProductCardComponentProps, which includes ImportedProductCardProps, this works.
      onEdit(props);
    } else {
      console.warn("onEdit handler not provided to ProductCard for item:", id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(props); // Pass the entire 'props' object
    } else {
      console.warn(
        "onDelete handler not provided to ProductCard for item:",
        id,
      );
    }
  };

  // --- Price Rendering Logic with improved type guards ---
  const renderPrice = () => {
    // Type guard using 'in' and checking specific properties
    if ("price" in props && typeof props.price === "string") {
      // TS now knows props is RegularProductProps within this block
      return (
        <span className="text-lg font-semibold text-primary">
          R{props.price}
        </span>
      );
    } else if (
      "salePrice" in props &&
      typeof props.salePrice === "string" &&
      "originalPrice" in props &&
      typeof props.originalPrice === "string"
    ) {
      // TS now knows props is SaleProductProps within this block
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-red-600">
            R{props.salePrice}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            R{props.originalPrice}
          </span>
        </div>
      );
    }
    return <span className="text-lg font-semibold text-primary">--</span>; // Fallback
  };

  // --- Rating Stars Rendering Logic ---
  const renderStars = () => {
    const starCount = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < starCount
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600",
            )}
            strokeWidth={i < starCount ? 0 : 1} // Add stroke to empty stars
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full sm:flex-1 p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow duration-200 relative group flex flex-col">
      {" "}
      {/* Added flex flex-col */}
      {/* Editor Icons Container */}
      {isEditor && (
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
          <button
            onClick={handleEditClick}
            className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/70 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Edit ${name}`}
            title={`Edit ${name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800/70 transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete ${name}`}
            title={`Delete ${name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {/* Image Container */}
      <div className="relative flex-shrink-0 flex justify-center items-center h-48 bg-secondary dark:bg-secondary/50 rounded-md mb-4 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name ?? "Product image"} // Provide default alt text
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // Example sizes
            className="object-contain p-1" // Use contain and padding
            priority={false} // Generally false unless it's above the fold critical image
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      {/* Text Content Area (Allow grow) */}
      <div className="flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="text-sm md:text-base text-foreground font-medium mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
          {name}
        </h3>

        {/* Price and Rating (Pushed to bottom) */}
        <div className="flex justify-between items-center mt-auto pt-2">
          {renderPrice()}
          {renderStars()}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
