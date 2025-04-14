"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useProductStore } from "../_store/product-store";
import { useProductsByPathname } from "../_store/useProductsByPathname";

interface SelectedFilters {
  [key: string]: string[];
}

const FilterSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get all products for generating available options
  const allProducts = useProductStore(state => state.allProducts);
  
  // Get products and category information from our custom hook
  const { 
    products, 
    activeCategory 
  } = useProductsByPathname();
  
  // Access filter setters from the Zustand store
  const setCategoryFilter = useProductStore(state => state.setCategoryFilter);
  const setPriceRangeFilter = useProductStore(state => state.setPriceRangeFilter);
  const setStockStatusFilter = useProductStore(state => state.setStockStatusFilter);
  const setColorFilters = useProductStore(state => state.setColorFilters);
  const setSizeFilters = useProductStore(state => state.setSizeFilters); // Updated to use setSizeFilters

  // Initialize selected filters
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    Category: [],
    "Stock Level": [],
    Color: [],
    "Price Range": [],
    Size: [],
  });

  // Define available categories with useMemo
  const categories = useMemo(
    () => [
      { name: "Apparel", value: "apparel" },
      { name: "Headwear", value: "headwear" },
      { name: "All Collections", value: "all-collections" },
    ],
    []
  );
  
  // Dynamically get available colors from ALL products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    
    if (allProducts && allProducts.length > 0) {
      allProducts.forEach(product => {
        product.variations?.forEach(variation => {
          if (variation.color) {
            colorSet.add(variation.color.charAt(0).toUpperCase() + variation.color.slice(1).toLowerCase());
          }
        });
      });
    }
    
    return Array.from(colorSet).sort();
  }, [allProducts]);
  
  // Dynamically get available sizes from ALL products, not just filtered ones
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    
    if (allProducts && allProducts.length > 0) {
      allProducts.forEach(product => {
        product.variations?.forEach(variation => {
          if (variation.size) {
            sizeSet.add(variation.size);
          }
        });
      });
    }
    
    return Array.from(sizeSet).sort();
  }, [allProducts]); // Changed dependency to allProducts
  
  // Generate price ranges based on products in ZAR
  const availablePriceRanges = useMemo(() => {
    return [
      "Under R500", 
      "R500-R1000", 
      "R1000-R2000", 
      "Over R2000"
    ];
  }, []);

  // Generate filters object with dynamic data
  const filters = useMemo(() => ({
    Category: categories.map((cat) => cat.name),
    "Stock Level": ["In Stock", "Out of Stock", "Low Stock"],
    Color: availableColors,
    "Price Range": availablePriceRanges,
    Size: availableSizes,
  }), [categories, availableColors, availablePriceRanges, availableSizes]);

  // Update selected category based on pathname
  useEffect(() => {
    if (!pathname) return;
    
    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    const matchedCategory = categories.find(
      (cat) => lastSegment.toLowerCase() === cat.value
    );

    if (matchedCategory) {
      setSelectedFilters(prev => ({
        ...prev,
        Category: [matchedCategory.name],
      }));
      setOpenDropdown("Category");
    }
  }, [pathname, categories]);

  // Convert price range label to actual min/max values
  const getPriceRangeValues = useCallback((label: string) => {
    switch(label) {
      case "Under R500":
        return { min: 0, max: 500 };
      case "R500-R1000":
        return { min: 500, max: 1000 };
      case "R1000-R2000":
        return { min: 1000, max: 2000 };
      case "Over R2000":
        return { min: 2000, max: null };
      default:
        return null;
    }
  }, []);

  const toggleDropdown = useCallback((dropdownName: string) => {
    setOpenDropdown(prev => prev === dropdownName ? null : dropdownName);
  }, []);

  const handleFilterChange = useCallback((category: string, value: string) => {
    setSelectedFilters(prev => {
      const updatedFilters = { ...prev };

      // Handle Category specially (exclusive selection)
      if (category === "Category") {
        if (updatedFilters[category].includes(value)) {
          updatedFilters[category] = [];
        } else {
          updatedFilters[category] = [value];
          // Find the matching route value and navigate
          const matchedCategory = categories.find((cat) => cat.name === value);
          if (matchedCategory) {
            router.push(`/${matchedCategory.value}`);
          }
        }
      } else {
        // For other filters, toggle selection (allow multiple)
        if (updatedFilters[category].includes(value)) {
          updatedFilters[category] = updatedFilters[category].filter(
            (item) => item !== value
          );
        } else {
          updatedFilters[category] = [...updatedFilters[category], value];
        }
      }

      return updatedFilters;
    });
  }, [categories, router]);

  // Apply filters to store when selections change
  const selectedPriceRanges = selectedFilters["Price Range"];
  const selectedStockLevels = selectedFilters["Stock Level"];
  const selectedColors = selectedFilters["Color"];
  const selectedSizes = selectedFilters["Size"];

  useEffect(() => {
    // Apply price range filter
    if (selectedPriceRanges && selectedPriceRanges.length > 0) {
      const priceRangeValues = getPriceRangeValues(selectedPriceRanges[0]);
      if (priceRangeValues) {
        setPriceRangeFilter({
          min: priceRangeValues.min,
          max: priceRangeValues.max,
          label: selectedPriceRanges[0]
        });
      }
    } else {
      setPriceRangeFilter(null);
    }

    // Apply stock status filter
    if (selectedStockLevels && selectedStockLevels.length > 0) {
      const status = selectedStockLevels[0].toLowerCase().replace(/\s+/g, '-');
      setStockStatusFilter(status as any);
    } else {
      setStockStatusFilter("all");
    }

    // Apply color filters
    if (selectedColors && selectedColors.length > 0) {
      setColorFilters(selectedColors.map(color => color.toLowerCase()));
    } else {
      setColorFilters([]);
    }
    
    // Apply size filters - updated to support multiple sizes
    if (selectedSizes && selectedSizes.length > 0) {
      setSizeFilters(selectedSizes);
    } else {
      setSizeFilters([]);
    }
  }, [
    selectedPriceRanges,
    selectedStockLevels,
    selectedColors,
    selectedSizes,
    getPriceRangeValues,
    setPriceRangeFilter,
    setStockStatusFilter,
    setColorFilters,
    setSizeFilters
  ]);

  const clearFilters = useCallback(() => {
    // Keep Category but clear other filters
    setSelectedFilters(prev => ({
      Category: prev.Category,
      "Stock Level": [],
      Color: [],
      "Price Range": [],
      Size: []
    }));
  }, []);

  // Check if there are any active filters (excluding Category)
  const hasActiveFilters = Object.entries(selectedFilters).some(
    ([category, filters]) => category !== "Category" && filters.length > 0
  );

  const FilterSection = useCallback(({
    title,
    options,
  }: {
    title: string;
    options: string[];
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleDropdown(title)}
        className="flex justify-between items-center w-full py-3 px-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {openDropdown === title ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {openDropdown === title && (
        <div className="px-4 pb-3 space-y-2">
          {options.length > 0 ? (
            options.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters[title].includes(option)}
                  onChange={() => handleFilterChange(title, option)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-600">{option}</span>
              </label>
            ))
          ) : (
            <div className="text-sm text-gray-500">No options available</div>
          )}
        </div>
      )}
    </div>
  ), [openDropdown, selectedFilters, toggleDropdown, handleFilterChange]);

  const SidebarContent = useCallback(() => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-white hover:text-white bg-red-500 p-3 rounded-md"
            >
              Clear all
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(selectedFilters)
              .filter(([category]) => category !== "Category")
              .map(([category, values]) =>
                values.map((value) => (
                  <span
                    key={`${category}-${value}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                  >
                    {value}
                    <button
                      onClick={() => handleFilterChange(category, value)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
          </div>
        )}
      </div>
      <div className="divide-y divide-gray-200">
        {Object.entries(filters).map(([title, options]) => (
          <FilterSection key={title} title={title} options={options} />
        ))}
      </div>
    </div>
  ), [FilterSection, clearFilters, filters, handleFilterChange, hasActiveFilters, selectedFilters]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-black text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-6 w-6" />
      </button>

      {/* Mobile Slide-over */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;