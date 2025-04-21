
// Face shape detection fun
import React from "react";
import { FaceShapeOverlay } from "@/components/FaceShapeOverlay";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-fuchsia-100 flex flex-col items-center justify-center gap-8 py-12 px-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800 drop-shadow-lg text-center">
          Find Your Face Shape Instantly!
        </h1>
        <FaceShapeOverlay />
      </div>
    </div>
  );
};

export default Index;
