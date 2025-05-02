import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { FaceShapeInfo } from "./FaceShapeInfo";

type ShapeType = "oval" | "square" | "triangle" | "diamond" | "heart" | "round";

const shapeColors: Record<ShapeType, string> = {
  oval: "#6366f1", // indigo
  round: "#8b5cf6", // violet
  square: "#3b82f6", // blue
  triangle: "#22d3ee", // cyan
  diamond: "#f472b6", // pink
  heart: "#f59e42", // orange
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
  round: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      box.x + box.width / 2,
      box.y + box.height / 2,
      box.width / 2,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    ctx.restore();
  },
  square: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    const radius = box.width * 0.05;
    ctx.moveTo(box.x + radius, box.y);
    ctx.lineTo(box.x + box.width - radius, box.y);
    ctx.arcTo(box.x + box.width, box.y, box.x + box.width, box.y + radius, radius);
    ctx.lineTo(box.x + box.width, box.y + box.height - radius);
    ctx.arcTo(box.x + box.width, box.y + box.height, box.x + box.width - radius, box.y + box.height, radius);
    ctx.lineTo(box.x + radius, box.y + box.height);
    ctx.arcTo(box.x, box.y + box.height, box.x, box.y + box.height - radius, radius);
    ctx.lineTo(box.x, box.y + radius);
    ctx.arcTo(box.x, box.y, box.x + radius, box.y, radius);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  triangle: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(box.x + box.width / 2, box.y);
    ctx.lineTo(box.x, box.y + box.height * 0.8);
    ctx.lineTo(box.x + box.width, box.y + box.height * 0.8);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  diamond: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(box.x + box.width / 2, box.y + box.height * 0.1);
    ctx.lineTo(box.x + box.width * 0.15, box.y + box.height / 2);
    ctx.lineTo(box.x + box.width / 2, box.y + box.height * 0.9);
    ctx.lineTo(box.x + box.width * 0.85, box.y + box.height / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  heart: (ctx, box) => {
    ctx.save();
    ctx.beginPath();
    const x = box.x + box.width / 2;
    const y = box.y + box.height * 0.35;
    const w = box.width * 0.45;
    const h = box.height * 0.45;
    
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x - w * 0.35, y - h * 0.5,
      x - w, y,
      x - w * 0.7, y + h * 0.5
    );
    ctx.bezierCurveTo(
      x - w * 0.5, y + h,
      x, y + h * 1.2,
      x, y + h * 1.2
    );
    ctx.bezierCurveTo(
      x, y + h * 1.2,
      x + w * 0.5, y + h,
      x + w * 0.7, y + h * 0.5
    );
    ctx.bezierCurveTo(
      x + w, y,
      x + w * 0.35, y - h * 0.5,
      x, y
    );
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
};

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function calculateJawSquareness(jawPoints: Array<{ x: number; y: number }>): number {
  const left = jawPoints[4];
  const right = jawPoints[12];
  const chin = jawPoints[8];
  const avgYSide = (left.y + right.y) / 2;
  const squareness = 1 - Math.abs(avgYSide - chin.y) / (chin.y - jawPoints[0].y + 1e-4);
  const sideDist = distance(left, right);
  const baseDist = distance(jawPoints[0], jawPoints[16]);
  const straightness = sideDist / baseDist;
  return (squareness + straightness) / 2;
}

function classifyFaceShape(landmarks: faceapi.FaceLandmarks68): ShapeType {
  const jaw = landmarks.getJawOutline();
  const leftJaw = jaw[0];
  const rightJaw = jaw[16];
  const chin = jaw[8];
  
  const leftBrow = landmarks.getLeftEyeBrow()[0];
  const rightBrow = landmarks.getRightEyeBrow()[4];
  const leftEye = landmarks.getLeftEye()[0];
  const rightEye = landmarks.getRightEye()[3];
  
  const foreheadMid = {
    x: (leftBrow.x + rightBrow.x) / 2,
    y: (leftBrow.y + rightBrow.y) / 2 - 5,
  };
  
  const leftCheekbone = jaw[2];
  const rightCheekbone = jaw[14];
  
  const jawWidth = distance(leftJaw, rightJaw);
  const cheekboneWidth = distance(leftCheekbone, rightCheekbone);
  const foreheadWidth = distance(leftBrow, rightBrow) * 1.15;
  const faceLength = distance(foreheadMid, chin) * 1.1;
  
  const leftJawMid = jaw[4];
  const rightJawMid = jaw[12];
  const jawMidWidth = distance(leftJawMid, rightJawMid);
  
  const jawSquareness = calculateJawSquareness(jaw);
  const jawAngle = calculateJawAngle(jaw);
  const jawCurve = calculateJawlineCurve(jaw);
  
  const lengthToWidthRatio = faceLength / cheekboneWidth;
  const foreheadToJawRatio = foreheadWidth / jawWidth;
  const cheekToJawRatio = cheekboneWidth / jawWidth;
  const cheekToForeheadRatio = cheekboneWidth / foreheadWidth;
  const jawToMidJawRatio = jawWidth / jawMidWidth;
  
  const topThird = foreheadWidth;
  const middleThird = cheekboneWidth;
  const bottomThird = jawWidth;
  
  const topToMiddleRatio = topThird / middleThird;
  const bottomToMiddleRatio = bottomThird / middleThird;
  
  console.log("Face Measurements:", {
    jawWidth,
    cheekboneWidth,
    foreheadWidth,
    faceLength,
    jawCurve,
    jawAngle,
    jawSquareness,
    lengthToWidthRatio,
    foreheadToJawRatio,
    cheekToJawRatio,
    cheekToForeheadRatio,
    jawToMidJawRatio,
    topToMiddleRatio,
    bottomToMiddleRatio
  });

  // Square face - Strong jaw, similar widths at forehead, cheekbones, and jaw
  if (
    jawSquareness > 0.7 &&
    Math.abs(jawWidth - cheekboneWidth) / jawWidth < 0.12 &&
    Math.abs(foreheadWidth - jawWidth) / foreheadWidth < 0.15 &&
    bottomToMiddleRatio > 0.92 && 
    lengthToWidthRatio < 1.25 &&
    jawAngle > 0.2
  ) {
    return "square";
  }
  
  // Round face - Width and length similar, softer angles
  if (
    lengthToWidthRatio < 1.15 &&
    jawCurve < 0.15 &&
    jawAngle < 0.18 &&
    jawSquareness < 0.62 &&
    Math.abs(jawWidth - cheekboneWidth) / jawWidth < 0.1
  ) {
    return "round";
  }
  
  // Triangle face - Wider jaw than forehead
  if (
    foreheadToJawRatio < 0.9 &&
    jawWidth > foreheadWidth * 1.1 &&
    bottomToMiddleRatio > 1.05 &&
    jawAngle > 0.15
  ) {
    return "triangle";
  }
  
  // Heart face - Wider forehead than jaw
  if (
    foreheadToJawRatio > 1.2 &&
    cheekToJawRatio > 1.15 &&
    lengthToWidthRatio < 1.35 &&
    topToMiddleRatio > 0.95 &&
    bottomToMiddleRatio < 0.85
  ) {
    return "heart";
  }
  
  // Diamond face - Cheekbones are the widest point
  if (
    cheekToForeheadRatio > 1.15 &&
    cheekToJawRatio > 1.15 &&
    topToMiddleRatio < 0.88 &&
    bottomToMiddleRatio < 0.9 &&
    lengthToWidthRatio > 1.15
  ) {
    return "diamond";
  }
  
  // Oval face - Length greater than width, gentle curves
  if (
    lengthToWidthRatio > 1.2 && 
    lengthToWidthRatio < 1.5 &&
    jawCurve < 0.25 &&
    jawSquareness < 0.65 &&
    bottomToMiddleRatio < 0.95 &&
    topToMiddleRatio < 0.95
  ) {
    return "oval";
  }
  
  // Scoring system for when no clear match is found
  let scores = {
    square: 0,
    round: 0,
    triangle: 0,
    heart: 0,
    diamond: 0,
    oval: 0
  };
  
  // Square scoring
  if (jawSquareness > 0.65) scores.square += 2;
  if (Math.abs(jawWidth - cheekboneWidth) / jawWidth < 0.15) scores.square += 1;
  if (Math.abs(foreheadWidth - jawWidth) / foreheadWidth < 0.18) scores.square += 1;
  if (bottomToMiddleRatio > 0.9) scores.square += 1;
  if (jawAngle > 0.2) scores.square += 1;
  
  // Round scoring
  if (lengthToWidthRatio < 1.15) scores.round += 2;
  if (jawCurve < 0.15) scores.round += 1;
  if (jawSquareness < 0.6) scores.round += 1;
  if (Math.abs(jawWidth - cheekboneWidth) / jawWidth < 0.12) scores.round += 1;
  
  // Triangle scoring
  if (foreheadToJawRatio < 0.9) scores.triangle += 2;
  if (jawWidth > foreheadWidth * 1.1) scores.triangle += 2;
  if (bottomToMiddleRatio > 1.05) scores.triangle += 1;
  
  // Heart scoring
  if (foreheadToJawRatio > 1.15) scores.heart += 2;
  if (bottomToMiddleRatio < 0.85) scores.heart += 1;
  if (topToMiddleRatio > 0.95) scores.heart += 1;
  if (cheekToJawRatio > 1.1) scores.heart += 1;
  
  // Diamond scoring
  if (cheekToForeheadRatio > 1.1 && cheekToJawRatio > 1.1) scores.diamond += 3;
  if (topToMiddleRatio < 0.9 && bottomToMiddleRatio < 0.9) scores.diamond += 2;
  
  // Oval scoring
  if (lengthToWidthRatio > 1.2 && lengthToWidthRatio < 1.5) scores.oval += 2;
  if (jawCurve < 0.2) scores.oval += 1;
  if (jawSquareness < 0.65) scores.oval += 1;
  
  // Find the shape with the highest score
  let bestMatch: ShapeType = "oval";
  let highestScore = 0;
  
  for (const [shape, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestMatch = shape as ShapeType;
    }
  }
  
  console.log("Shape scores:", scores, "Best match:", bestMatch);
  return bestMatch;
}

function calculateJawlineCurve(jawPoints: Array<{ x: number; y: number }>): number {
  const lowerJaw = jawPoints.slice(3, 14);
  
  const start = lowerJaw[0];
  const end = lowerJaw[lowerJaw.length - 1];
  
  const a = end.y - start.y;
  const b = start.x - end.x;
  const c = end.x * start.y - start.x * end.y;
  
  let totalDeviation = 0;
  for (const point of lowerJaw) {
    const distance = Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
    totalDeviation += distance;
  }
  
  return totalDeviation / distance(start, end);
}

function calculateJawAngle(jawPoints: Array<{ x: number; y: number }>): number {
  const leftCorner = jawPoints[2];
  const rightCorner = jawPoints[14];
  const chin = jawPoints[8];
  
  const leftAngle = calculateAngle(jawPoints[1], leftCorner, jawPoints[3]);
  const rightAngle = calculateAngle(jawPoints[13], rightCorner, jawPoints[15]);
  
  return (leftAngle + rightAngle) / 2;
}

function calculateAngle(
  p1: { x: number; y: number }, 
  p2: { x: number; y: number }, 
  p3: { x: number; y: number }
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.min(Math.max(cosAngle, -1), 1));
}

export const FaceShapeOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detectedShape, setDetectedShape] = useState<ShapeType | null>(null);
  const [showShapeInfo, setShowShapeInfo] = useState(false);

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
            console.error("Error in face detection:", err);
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
        <div className="mt-4 text-center bg-white bg-opacity-80 rounded-lg px-6 py-3 shadow-md">
          <div className="text-lg font-bold text-gray-800">
            Your face shape:{" "}
            <span style={{ color: shapeColors[detectedShape] }}>
              {detectedShape.charAt(0).toUpperCase() + detectedShape.slice(1)}
            </span>
          </div>
          <button
            onClick={() => setShowShapeInfo(!showShapeInfo)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showShapeInfo ? "Hide details" : "Learn more about your face shape"}
          </button>
        </div>
      )}

      {detectedShape && showShapeInfo && (
        <FaceShapeInfo shapeType={detectedShape} onClose={() => setShowShapeInfo(false)} />
      )}
      
      {!detectedShape && modelLoaded && (
        <div className="mt-4 text-center text-base text-gray-600 bg-white bg-opacity-70 rounded px-3 py-1 shadow-sm">
          Position your face in the frame to analyze its shape!
        </div>
      )}
    </div>
  );
};
