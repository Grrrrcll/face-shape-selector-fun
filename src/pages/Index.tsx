
// Face shape selector fun
import React, { useState } from "react";
import { FaceShapeOverlay } from "@/components/FaceShapeOverlay";
import { FaceShapeSelector } from "@/components/FaceShapeSelector";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedShape, setSelectedShape] = useState<
    "oval" | "square" | "triangle" | "diamond" | "heart"
  >("oval");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-fuchsia-100 flex flex-col md:flex-row items-center justify-center gap-8 py-12 px-4">
      <div className="flex flex-row md:flex-col items-center">
        <FaceShapeSelector selected={selectedShape} onChange={setSelectedShape} />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800 drop-shadow-lg text-center">
          Find Your Best Face Shape!
        </h1>
        <FaceShapeOverlay shape={selectedShape} />
      </div>
    </div>
  );
};

export default Index;
