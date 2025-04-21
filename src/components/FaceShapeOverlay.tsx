
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

type ShapeType = "oval" | "square" | "triangle" | "diamond" | "heart";

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

// Helper function to calculate Euclidean distance between two points
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Very simple classifier based on positions of landmarks.
// For a real-world app, more sophisticated ML should be used.
function classifyFaceShape(landmarks: faceapi.FaceLandmarks68): ShapeType {
  const jaw = landmarks.getJawOutline();
  const leftJaw = jaw[0];
  const rightJaw = jaw[16];
  const chin = jaw[8];

  // Forehead is approximated using midpoint between eyebrows points
  const leftBrow = landmarks.getLeftEyeBrow()[0];
  const rightBrow = landmarks.getRightEyeBrow()[4];
  const middleBrow = {
    x: (leftBrow.x + rightBrow.x) / 2,
    y: (leftBrow.y + rightBrow.y) / 2,
  };

  // Cheekbones: use points 3 and 13 (just above jaw on each side)
  const leftCheekbone = jaw[3];
  const rightCheekbone = jaw[13];

  const faceWidth = distance(leftJaw, rightJaw);
  const cheekboneWidth = distance(leftCheekbone, rightCheekbone);
  const foreheadWidth = distance(leftBrow, rightBrow);
  const faceLength = distance(middleBrow, chin);

  // Ratio helpers
  const fw_cw = foreheadWidth / cheekboneWidth;
  const jaw_cheek = faceWidth / cheekboneWidth;
  const fl_cw = faceLength / cheekboneWidth;

  // "Classic" rules (very simple, threshold-tuned by hand)
  if (
    fl_cw > 1.45 &&
    Math.abs(cheekboneWidth - foreheadWidth) < 10 &&
    Math.abs(cheekboneWidth - faceWidth) < 10
  ) {
    return "oval";
  }
  if (
    Math.abs(foreheadWidth - cheekboneWidth) < 10 &&
    Math.abs(cheekboneWidth - faceWidth) < 10 &&
    Math.abs(faceLength - faceWidth) < 20
  ) {
    return "square";
  }
  if (
    foreheadWidth < cheekboneWidth &&
    faceWidth < cheekboneWidth &&
    fl_cw < 1.3
  ) {
    return "diamond";
  }
  if (
    foreheadWidth > cheekboneWidth &&
    faceWidth < cheekboneWidth &&
    fl_cw > 1.3
  ) {
    return "heart";
  }
  // Approximate triangle: wide jaw, short forehead
  if (
    faceWidth > cheekboneWidth &&
    cheekboneWidth > foreheadWidth &&
    fl_cw < 1.35
  ) {
    return "triangle";
  }
  // Fallback
  return "oval";
}

export const FaceShapeOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detectedShape, setDetectedShape] = useState<ShapeType | null>(null);

  // Load models
  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
        );
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
          "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
        );
        setModelLoaded(true);
      } catch (err) {
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
        } catch (err) {
          setError(
            "Unable to access webcam. Please check your camera permissions and ensure no other applications are using your camera."
          );
        }
      }
    }
    start();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let stop = false;
    async function detectFaceShape() {
      setDetecting(true);
      while (!stop && modelLoaded) {
        if (
          videoRef.current &&
          videoRef.current.readyState === 4 &&
          canvasRef.current
        ) {
          const ctx = canvasRef.current.getContext("2d");
          // Always clear the canvas
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          try {
            const detection = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
              )
              .withFaceLandmarks(true);

            if (detection && ctx) {
              const landmarks = detection.landmarks as faceapi.FaceLandmarks68;
              const shape = classifyFaceShape(landmarks);
              setDetectedShape(shape);

              ctx.lineWidth = 4;
              ctx.strokeStyle = shapeColors[shape];
              ctx.shadowColor = "#00000080";
              ctx.shadowBlur = 10;

              shapeDrawers[shape](ctx, detection.detection.box);
            } else {
              setDetectedShape(null);
            }
          } catch (err) {
            // If detection fails for a frame, skip but don't crash
          }
        }
        await new Promise((r) => setTimeout(r, 80));
      }
    }
    if (modelLoaded) detectFaceShape();
    return () => {
      stop = true;
    };
  }, [modelLoaded]);

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
        <span className="absolute left-2 top-2 text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded">
          {!modelLoaded
            ? "Loading model..."
            : error
            ? "Not available"
            : detectedShape
            ? "Face detected"
            : "Looking for a face…"}
        </span>
      </div>
      {detectedShape && (
        <div className="mt-4 text-center text-lg font-bold text-gray-700 bg-white bg-opacity-80 rounded px-4 py-2 shadow-md">
          Your face shape:{" "}
          <span style={{ color: shapeColors[detectedShape] }}>
            {detectedShape.charAt(0).toUpperCase() + detectedShape.slice(1)}
          </span>
        </div>
      )}
      {!detectedShape && modelLoaded && (
        <div className="mt-4 text-center text-base text-gray-600 bg-white bg-opacity-70 rounded px-3 py-1 shadow-sm">
          Position your face in the frame to analyze its shape!
        </div>
      )}
    </div>
  );
};
