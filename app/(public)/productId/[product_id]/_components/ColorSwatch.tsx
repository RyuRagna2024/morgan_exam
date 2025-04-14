"use client";

import { useMemo } from "react";

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

export const ColorSwatch = ({ color, selected, onClick }: ColorSwatchProps) => {
  const colorClass = useMemo(() => {
    const colorMap: Record<string, string> = {
      black: "bg-black",
      white: "bg-white border",
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-400",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500",
    };
    return colorMap[color.toLowerCase()] || "bg-gray-300";
  }, [color]);

  return (
    <div
      className={`w-6 h-6 rounded-full cursor-pointer ${colorClass} ${
        selected ? "ring-2 ring-offset-1 ring-black" : ""
      }`}
      title={color}
      onClick={onClick}
    />
  );
};

export default ColorSwatch;
