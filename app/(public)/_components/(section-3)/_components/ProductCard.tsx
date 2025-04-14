import React from "react";
import Image from "next/image";
import { Package, Star } from "lucide-react";
import { ProductCardProps } from "../types";

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { name, rating, image } = props;

  const renderPrice = () => {
    if ("price" in props) {
      return (
        <span className="text-lg font-semibold text-primary">
          R{props.price}
        </span>
      );
    } else {
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
  };

  return (
    <div className="w-full sm:flex-1 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="relative flex justify-center items-center h-48 bg-secondary rounded-md mb-4">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover rounded-md"
            priority
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-card-foreground font-medium mb-2 line-clamp-1">
        {name}
      </h3>
      <div className="flex justify-between items-center mb-2">
        {renderPrice()}
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
