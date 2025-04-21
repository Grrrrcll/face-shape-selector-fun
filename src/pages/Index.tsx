
// Face shape detection fun
import React from "react";
import { FaceShapeOverlay } from "@/components/FaceShapeOverlay";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-fuchsia-100 flex flex-col items-center justify-center gap-8 py-12 px-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 drop-shadow-lg text-center">
          Find Your Face Shape Instantly!
        </h1>
        <p className="text-gray-600 text-center mb-8 max-w-lg mx-auto">
          Position your face in the frame and our AI will analyze your facial features to determine your face shape.
        </p>
        <FaceShapeOverlay />
        
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Your face shape can help you choose the most flattering hairstyles, glasses, and makeup techniques.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
