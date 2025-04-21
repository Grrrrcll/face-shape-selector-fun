
import React from "react";
import { cn } from "@/lib/utils";
import { Diamond, Heart, Square, Triangle, Circle } from "lucide-react";

// The icons used here are from Lucide, corresponding closely to the shapes.
type ShapeType = "oval" | "square" | "triangle" | "diamond" | "heart";
const allShapes: { label: string; type: ShapeType; icon: React.ReactNode }[] = [
  {
    label: "Oval",
    type: "oval",
    icon: <Circle className="w-7 h-7" />,
  },
  {
    label: "Square",
    type: "square",
    icon: <Square className="w-7 h-7" />,
  },
  {
    label: "Triangle",
    type: "triangle",
    icon: <Triangle className="w-7 h-7" />,
  },
  {
    label: "Diamond",
    type: "diamond",
    icon: <Diamond className="w-7 h-7" />,
  },
  {
    label: "Heart",
    type: "heart",
    icon: <Heart className="w-7 h-7" />,
  },
];

interface Props {
  selected: ShapeType;
  onChange: (s: ShapeType) => void;
}

export const FaceShapeSelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      {allShapes.map((shape) => (
        <button
          key={shape.type}
          type="button"
          className={cn(
            "rounded-full p-2 transition-all border-2 shadow-md bg-white bg-opacity-80 hover:scale-110 hover:border-gray-400",
            selected === shape.type
              ? "border-blue-500 scale-105 ring-2 ring-blue-300"
              : "border-transparent"
          )}
          aria-label={shape.label}
          onClick={() => onChange(shape.type)}
        >
          <div
            className={cn(
              "text-gray-700",
              selected === shape.type && "text-blue-500"
            )}
          >
            {shape.icon}
          </div>
        </button>
      ))}
    </div>
  );
};
