// app/(public)/(group-products)/_components/(filterside)/FilterSidebar.tsx
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useProductStore } from "../_store/product-store";
import { useProductsByPathname } from "../_store/useProductsByPathname";
import { cn } from "@/lib/utils"; // Import cn

interface SelectedFilters {
  [key: string]: string[];
}

const FilterSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const allProducts = useProductStore((state) => state.allProducts);
  const { products, activeCategory } = useProductsByPathname();

  // Filter setters
  const setCategoryFilter = useProductStore((state) => state.setCategoryFilter);
  const setPriceRangeFilter = useProductStore(
    (state) => state.setPriceRangeFilter,
  );
  const setStockStatusFilter = useProductStore(
    (state) => state.setStockStatusFilter,
  );
  const setColorFilters = useProductStore((state) => state.setColorFilters);
  const setSizeFilters = useProductStore((state) => state.setSizeFilters);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    Category: [],
    "Stock Level": [],
    Color: [],
    "Price Range": [],
    Size: [],
  });

  // --- Data Memoization (no changes needed here) ---
  const categories = useMemo(
    () => [
      /* ... */ { name: "Apparel", value: "apparel" },
      { name: "Headwear", value: "headwear" },
      { name: "All Collections", value: "all-collections" },
    ],
    [],
  );
  const availableColors = useMemo(() => {
    /* ... */ const colorSet = new Set<string>();
    if (allProducts) {
      allProducts.forEach((p) =>
        p.variations?.forEach(
          (v) =>
            v.color &&
            colorSet.add(
              v.color.charAt(0).toUpperCase() + v.color.slice(1).toLowerCase(),
            ),
        ),
      );
    }
    return Array.from(colorSet).sort();
  }, [allProducts]);
  const availableSizes = useMemo(() => {
    /* ... */ const sizeSet = new Set<string>();
    if (allProducts) {
      allProducts.forEach((p) =>
        p.variations?.forEach((v) => v.size && sizeSet.add(v.size)),
      );
    }
    return Array.from(sizeSet).sort();
  }, [allProducts]);
  const availablePriceRanges = useMemo(
    () => ["Under R500", "R500-R1000", "R1000-R2000", "Over R2000"],
    [],
  );
  const filters = useMemo(
    () => ({
      Category: categories.map((c) => c.name),
      "Stock Level": ["In Stock", "Out of Stock", "Low Stock"],
      Color: availableColors,
      "Price Range": availablePriceRanges,
      Size: availableSizes,
    }),
    [categories, availableColors, availablePriceRanges, availableSizes],
  );
  // --- End Data Memoization ---

  // --- Effects and Handlers (no changes needed here) ---
  useEffect(() => {
    /* ... set selected category from path ... */ if (!pathname) return;
    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const matchedCategory = categories.find(
      (cat) => lastSegment?.toLowerCase() === cat.value,
    );
    if (matchedCategory) {
      setSelectedFilters((prev) => ({
        ...prev,
        Category: [matchedCategory.name],
      }));
      setOpenDropdown("Category");
    } else {
      setSelectedFilters((prev) => ({ ...prev, Category: [] }));
    }
  }, [pathname, categories]);
  const getPriceRangeValues = useCallback((label: string) => {
    /* ... */ switch (label) {
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
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  }, []);
  const handleFilterChange = useCallback(
    (category: string, value: string) => {
      setSelectedFilters((prev) => {
        const updated = { ...prev };
        if (category === "Category") {
          if (updated[category].includes(value)) {
            updated[category] = [];
          } else {
            updated[category] = [value];
            const matched = categories.find((c) => c.name === value);
            if (matched) router.push(`/${matched.value}`);
          }
        } else {
          if (updated[category].includes(value)) {
            updated[category] = updated[category].filter((i) => i !== value);
          } else {
            updated[category] = [...updated[category], value];
          }
        }
        return updated;
      });
    },
    [categories, router],
  );
  const selectedPriceRanges = selectedFilters["Price Range"];
  const selectedStockLevels = selectedFilters["Stock Level"];
  const selectedColors = selectedFilters["Color"];
  const selectedSizes = selectedFilters["Size"];
  useEffect(() => {
    /* ... apply filters to store ... */ const priceRangeValues =
      selectedPriceRanges.length > 0
        ? getPriceRangeValues(selectedPriceRanges[0])
        : null;
    setPriceRangeFilter(
      priceRangeValues
        ? { ...priceRangeValues, label: selectedPriceRanges[0] }
        : null,
    );
    const status =
      selectedStockLevels.length > 0
        ? (selectedStockLevels[0].toLowerCase().replace(/\s+/g, "-") as any)
        : "all";
    setStockStatusFilter(status);
    setColorFilters(
      selectedColors.length > 0
        ? selectedColors.map((c) => c.toLowerCase())
        : [],
    );
    setSizeFilters(selectedSizes.length > 0 ? selectedSizes : []);
  }, [
    selectedPriceRanges,
    selectedStockLevels,
    selectedColors,
    selectedSizes,
    getPriceRangeValues,
    setPriceRangeFilter,
    setStockStatusFilter,
    setColorFilters,
    setSizeFilters,
  ]);
  const clearFilters = useCallback(() => {
    setSelectedFilters((prev) => ({
      Category: prev.Category,
      "Stock Level": [],
      Color: [],
      "Price Range": [],
      Size: [],
    }));
  }, []);
  const hasActiveFilters = Object.entries(selectedFilters).some(
    ([cat, vals]) => cat !== "Category" && vals.length > 0,
  );
  // --- End Effects and Handlers ---

  // --- Updated FilterSection with dark mode styles ---
  const FilterSection = useCallback(
    ({ title, options }: { title: string; options: string[] }) => (
      // Use border-border for theme awareness
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={() => toggleDropdown(title)}
          // Added dark mode hover/text styles
          className="flex justify-between items-center w-full py-3 px-4 text-left hover:bg-accent dark:hover:bg-accent/50 transition-colors"
        >
          {/* Added dark mode text styles */}
          <span className="font-medium text-foreground">{title}</span>
          {/* Added dark mode text styles */}
          {openDropdown === title ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {openDropdown === title && (
          <div className="px-4 pb-3 space-y-2">
            {options.length > 0 ? (
              options.map((option) => (
                <label
                  key={option}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters[title].includes(option)}
                    onChange={() => handleFilterChange(title, option)}
                    // Use accent colors for checkbox
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary dark:focus:ring-offset-background"
                  />
                  {/* Added dark mode text styles */}
                  <span className="ml-3 text-sm text-muted-foreground dark:text-gray-300">
                    {option}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    ),
    [openDropdown, selectedFilters, toggleDropdown, handleFilterChange],
  );
  // --- End FilterSection ---

  // --- Updated SidebarContent with dark mode styles ---
  const SidebarContent = useCallback(
    () => (
      // Added dark mode background, border
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Use border-border */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            {/* Text color from card */}
            <h2 className="text-lg font-semibold text-card-foreground">
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                // Use secondary button styles for clear
                className="text-sm font-medium text-secondary-foreground hover:bg-secondary/80 bg-secondary px-3 py-1.5 rounded-md"
              >
                Clear all
              </button>
            )}
          </div>
          {/* Selected Filters Pills */}
          {hasActiveFilters && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(selectedFilters)
                .filter(([category]) => category !== "Category")
                .flatMap(([category, values]) =>
                  values.map((value) => (
                    // Pill styling with dark mode
                    <span
                      key={`${category}-${value}`}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border"
                    >
                      {value}
                      <button
                        onClick={() => handleFilterChange(category, value)}
                        className="ml-1 text-muted-foreground/60 hover:text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )),
                )}
            </div>
          )}
        </div>
        {/* Use border-border */}
        <div className="divide-y divide-border">
          {Object.entries(filters).map(([title, options]) => (
            <FilterSection key={title} title={title} options={options} />
          ))}
        </div>
      </div>
    ),
    [
      FilterSection,
      clearFilters,
      filters,
      handleFilterChange,
      hasActiveFilters,
      selectedFilters,
    ],
  );
  // --- End SidebarContent ---

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        // Use primary color for floating button
        className="lg:hidden fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg z-50 flex items-center justify-center hover:bg-primary/90"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-6 w-6" />
      </button>

      {/* Mobile Slide-over */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          {/* Added dark mode background */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              {/* Use border-border */}
              <div className="p-4 border-b border-border flex justify-between items-center">
                {/* Text should adapt */}
                <h2 className="text-lg font-semibold text-foreground">
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Reuse SidebarContent - styles applied within it */}
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
