import { useRef, useState, useCallback, useEffect, forwardRef } from "react";
import { Camera, RotateCcw, SwitchCamera, XCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onFallbackToUpload: () => void;
}

type CameraState = "idle" | "requesting" | "active" | "captured" | "denied" | "error";

const CameraCapture = forwardRef<HTMLDivElement, CameraCaptureProps>(({ onCapture, onFallbackToUpload }, _ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    stopStream();
    setState("requesting");
    setErrorMessage("");

    try {
      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);

      setState("active");
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setState("denied");
        setErrorMessage("Camera access was denied. Please allow camera permissions in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setState("error");
        setErrorMessage("No camera found on this device.");
      } else {
        setState("error");
        setErrorMessage("Could not access camera. Please try again or upload an image instead.");
      }
    }
  }, [facingMode, stopStream]);

  // Attach stream to video element when it becomes available
  useEffect(() => {
    if (state === "active" && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      const playVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error("Video play failed:", err);
        }
      };

      playVideo();
    }
  }, [state]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    // Use actual video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if using front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    stopStream();
    setState("captured");
  }, [stopStream, facingMode]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedImage) return;
    // Convert data URL to File
    const byteString = atob(capturedImage.split(",")[1]);
    const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
  }, [capturedImage, onCapture]);

  const switchCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  // Idle state - show start button
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Camera className="h-8 w-8 text-accent" />
        </div>
        <p className="text-sm font-medium text-foreground">Use your camera to scan a plant leaf</p>
        <p className="text-xs text-muted-foreground">We'll use your device camera to capture an image</p>
        <Button onClick={() => startCamera()} variant="default" size="lg">
          <Camera className="h-4 w-4 mr-2" /> Open Camera
        </Button>
      </div>
    );
  }

  // Permission denied or error
  if (state === "denied" || state === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-8 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">{errorMessage}</p>
        <div className="flex gap-3">
          <Button onClick={() => startCamera()} variant="outline" size="sm">
            Try Again
          </Button>
          <Button onClick={onFallbackToUpload} variant="default" size="sm">
            <Upload className="h-4 w-4 mr-2" /> Upload Instead
          </Button>
        </div>
      </div>
    );
  }

  // Requesting permission
  if (state === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-foreground">Requesting camera access...</p>
        <p className="text-xs text-muted-foreground">Please allow camera permissions when prompted</p>
      </div>
    );
  }

  // Captured state
  if (state === "captured" && capturedImage) {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
        <div className="relative">
          <img src={capturedImage} alt="Captured plant" className="w-full h-64 object-contain bg-black/5" />
        </div>
        <div className="flex gap-3 p-4 border-t border-border bg-background/80">
          <Button onClick={retake} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" /> Retake
          </Button>
          <Button onClick={confirmCapture} variant="success" className="flex-1">
            Use This Photo
          </Button>
        </div>
      </div>
    );
  }

  // Active camera view
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-black">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-8 border-2 border-white/30 rounded-lg" />
          <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-md" />
          <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-md" />
          <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-md" />
          <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-md" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 p-4 bg-background/90 border-t border-border">
        {hasMultipleCameras && (
          <Button onClick={switchCamera} variant="outline" size="icon" title="Switch camera">
            <SwitchCamera className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={captureFrame} size="lg" className="rounded-full h-14 w-14 p-0">
          <Camera className="h-6 w-6" />
        </Button>
        <Button onClick={() => { stopStream(); setState("idle"); }} variant="outline" size="icon" title="Close camera">
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
