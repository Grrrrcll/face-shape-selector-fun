
import React from "react";

type ShapeType = "oval" | "square" | "triangle" | "diamond" | "heart" | "round";

interface FaceShapeInfoProps {
  shapeType: ShapeType;
  onClose: () => void;
}

const shapeImages: Record<ShapeType, string> = {
  oval: "/lovable-uploads/a94a4dec-56b8-47b7-8313-fbfdf22e0002.png",
  round: "/lovable-uploads/afa6c80b-d94d-4176-9333-38f7a4ebc359.png",
  square: "/lovable-uploads/f7f96fae-fcf4-4eb8-8c69-fda4f53605a6.png",
  diamond: "/lovable-uploads/a27b8790-32f8-477c-aaa9-942289a267ba.png",
  triangle: "/lovable-uploads/a27b8790-32f8-477c-aaa9-942289a267ba.png", // Using diamond as placeholder
  heart: "/lovable-uploads/f7f96fae-fcf4-4eb8-8c69-fda4f53605a6.png", // Using square as placeholder
};

const shapeDescriptions: Record<ShapeType, { description: string; characteristics: string[]; hairStyles: string[] }> = {
  oval: {
    description: "The oval face shape is considered the most versatile for hairstyles and makeup. The face is longer than it is wide with a gently curved jawline.",
    characteristics: [
      "Balanced proportions",
      "Slightly narrower forehead than cheekbones",
      "Gently curved jawline",
      "No particularly sharp angles"
    ],
    hairStyles: [
      "Almost any haircut works well",
      "Long layers",
      "Medium-length cuts with soft layers",
      "Bangs of any length or style"
    ]
  },
  round: {
    description: "Round faces have soft angles with width and length in similar proportions. The cheeks are usually the widest part of the face.",
    characteristics: [
      "Face length and width are similar",
      "Curved jawline without sharp angles",
      "Full cheeks",
      "Rounded chin"
    ],
    hairStyles: [
      "Layered cuts that add height",
      "Side-swept bangs",
      "Long, layered styles",
      "Pixie cuts with volume on top"
    ]
  },
  square: {
    description: "Square faces have strong, angular features with a prominent jawline and typically equal width at the forehead, cheekbones, and jaw.",
    characteristics: [
      "Strong, angular jawline",
      "Forehead, cheekbones, and jawline are similar in width",
      "Minimal curve at the chin",
      "Straight sides of the face"
    ],
    hairStyles: [
      "Soft layers around the face",
      "Side-parted styles",
      "Waves and curls to soften angles",
      "Long, wispy bangs"
    ]
  },
  triangle: {
    description: "The triangle (or pear) face shape is characterized by a narrower forehead and wider jawline. The chin may be squared or slightly rounded.",
    characteristics: [
      "Jawline wider than forehead",
      "Can have a square or slightly rounded jawline",
      "Narrow forehead",
      "May have a strong chin"
    ],
    hairStyles: [
      "Volume-adding styles at the temples and crown",
      "Side-swept bangs",
      "Layered mid-length cuts",
      "Styles with fullness on top"
    ]
  },
  diamond: {
    description: "Diamond face shapes have narrow foreheads and jawlines with the cheekbones as the widest point. Features tend to be angular and well-defined.",
    characteristics: [
      "Narrow forehead and jawline",
      "Wide, high cheekbones",
      "Possibly pointed chin",
      "Angular features"
    ],
    hairStyles: [
      "Chin-length bobs",
      "Side-swept or curtain bangs",
      "Hair that adds width at jaw and forehead",
      "Soft layers around the face"
    ]
  },
  heart: {
    description: "Heart-shaped faces are wider at the forehead and hairline, narrowing to a small or pointed chin. The cheekbones are often high and well-defined.",
    characteristics: [
      "Wide forehead and/or hairline",
      "High cheekbones",
      "Narrow jawline and chin",
      "May have a widow's peak"
    ],
    hairStyles: [
      "Side-parted styles",
      "Chin-length or longer cuts",
      "Layered cuts that add width around the jaw",
      "Long, side-swept bangs"
    ]
  }
};

export const FaceShapeInfo: React.FC<FaceShapeInfoProps> = ({ shapeType, onClose }) => {
  const info = shapeDescriptions[shapeType];
  
  return (
    <div className="mt-4 w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Face Shape
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 overflow-hidden rounded-lg shadow">
            <img 
              src={shapeImages[shapeType]} 
              alt={`${shapeType} face shape example`} 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-600 text-sm">{info.description}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Characteristics:</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {info.characteristics.map((trait, index) => (
              <li key={index}>{trait}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Flattering Hairstyles:</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {info.hairStyles.map((style, index) => (
              <li key={index}>{style}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
