
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

type ShapeType = "oval" | "square" | "triangle" | "diamond" | "heart";

interface Props {
  shape: ShapeType;
}

const shapeColors: Record<ShapeType, string> = {
  oval: "#ffffff",
  square: "#3b82f6",
  triangle: "#22d3ee",
  diamond: "#f472b6",
  heart: "#f59e42",
};

const shapeDrawers: Record<
  ShapeType,
  (ctx: CanvasRenderingContext2D, box: faceapi.Box) => void
> = {
  oval: (ctx, box) => {
    // Draw an oval around the face
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      box.x + box.width / 2,
      box.y + box.height / 2,
      box.width / 2,
      box.height / 2,
      0,
      0,
      2 * Math.PI,
    );
    ctx.stroke();
    ctx.restore();
  },
  square: (ctx, box) => {
    ctx.save();
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.restore();
  },
  triangle: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(box.x + box.width / 2, box.y); // Top center
    ctx.lineTo(box.x, box.y + box.height); // Bottom left
    ctx.lineTo(box.x + box.width, box.y + box.height); // Bottom right
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  diamond: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(box.x + box.width / 2, box.y); // Top
    ctx.lineTo(box.x, box.y + box.height / 2); // Left
    ctx.lineTo(box.x + box.width / 2, box.y + box.height); // Bottom
    ctx.lineTo(box.x + box.width, box.y + box.height / 2); // Right
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  heart: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    // Approximate heart shape using Bezier curves
    const x = box.x + box.width / 2;
    const y = box.y + box.height * 0.40;
    const w = box.width / 2;
    const h = box.height / 2;
    ctx.moveTo(x, y + h / 2);
    ctx.bezierCurveTo(x, y, x - w, y, x - w, y + h / 2);
    ctx.bezierCurveTo(x - w, y + h, x, y + h * 1.6, x, y + h * 1.5);
    ctx.bezierCurveTo(x, y + h * 1.6, x + w, y + h, x + w, y + h / 2);
    ctx.bezierCurveTo(x + w, y, x, y, x, y + h / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
};

export const FaceShapeOverlay: React.FC<Props> = ({ shape }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load models
  useEffect(() => {
    async function loadModels() {
      try {
        // Update model URL to use githubusercontent which is more reliable
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
        );
        console.log("Face detection model loaded successfully");
        setModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        setError("Failed to load face detection models. Please try again later.");
      }
    }
    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    async function start() {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          videoRef.current.srcObject = stream;
          console.log("Webcam access successful");
        } catch (err) {
          console.error("Webcam access error:", err);
          setError("Unable to access webcam. Please check your camera permissions and ensure no other applications are using your camera.");
        }
      }
    }
    start();

    // Cleanup function to stop the webcam when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stop = false;
    
    async function detectFace() {
      setDetecting(true);
      while (!stop && modelLoaded) {
        if (
          videoRef.current &&
          videoRef.current.readyState === 4 &&
          canvasRef.current
        ) {
          try {
            const detection = await faceapi.detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
            );
            
            // Clear canvas
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
              );
              
              // Draw overlay if detected
              if (detection && ctx) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = shapeColors[shape];
                ctx.shadowColor = "#00000080";
                ctx.shadowBlur = 10;
                shapeDrawers[shape](ctx, detection.box);
              }
            }
          } catch (err) {
            console.error("Error in face detection:", err);
          }
        }
        await new Promise((r) => setTimeout(r, 80));
      }
    }
    
    if (modelLoaded) {
      detectFace();
    }
    
    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, [shape, modelLoaded]);

  // Set canvas size to match video
  const setCanvasDimensions = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 font-semibold bg-white bg-opacity-90 rounded-lg shadow-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative rounded-xl overflow-hidden shadow-lg w-full max-w-[350px] aspect-[3/4] bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onLoadedMetadata={setCanvasDimensions}
        />
        <canvas
          ref={canvasRef}
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
        />
        {detecting && (
          <span className="absolute left-2 top-2 text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded">
            {!modelLoaded ? "Loading model..." : error ? "Not available" : "Face tracking…"}
          </span>
        )}
      </div>
      <div className="mt-4 text-center text-base font-bold text-gray-700 bg-white bg-opacity-70 rounded px-3 py-1 shadow-md">
        Try cycling shapes on your face to see what fits your face best!
      </div>
    </div>
  );
};
