"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, ImagePlus, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCAN_INTERVAL_MS = 120;
const MAX_FRAME_SIDE = 800;

/** Giải mã một khung hình: thử toàn khung trước, sau đó thử vùng giữa (QR nhỏ). */
function decodeFrame(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  canvas: HTMLCanvasElement
) {
  if (sourceWidth <= 0 || sourceHeight <= 0) return null;
  const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);

  const full = ctx.getImageData(0, 0, width, height);
  const fullCode = jsQR(full.data, width, height, { inversionAttempts: "attemptBoth" });
  if (fullCode?.data) return fullCode.data;

  // Thử lại trên vùng trung tâm để bắt QR nằm xa/chiếm ít diện tích khung hình.
  const cropWidth = Math.round(width * 0.7);
  const cropHeight = Math.round(height * 0.7);
  const crop = ctx.getImageData(
    Math.max(0, Math.round((width - cropWidth) / 2)),
    Math.max(0, Math.round((height - cropHeight) / 2)),
    cropWidth,
    cropHeight
  );
  const cropCode = jsQR(crop.data, cropWidth, cropHeight, { inversionAttempts: "attemptBoth" });
  return cropCode?.data ?? null;
}

export function QrScanner({
  open,
  onClose,
  onDetected,
}: {
  open: boolean;
  onClose: () => void;
  onDetected: (token: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef(0);
  const scannedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stopCamera() {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastScanRef.current = 0;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }

  function finish(token: string) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    stopCamera();
    onDetected(token);
    onClose();
  }

  function scanLoop(timestamp: number) {
    if (!streamRef.current) return;
    if (timestamp - lastScanRef.current >= SCAN_INTERVAL_MS) {
      lastScanRef.current = timestamp;
      const video = videoRef.current;
      if (video && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = canvas;
        const value = decodeFrame(video, video.videoWidth, video.videoHeight, canvas);
        if (value) {
          finish(value);
          return;
        }
      }
    }
    rafRef.current = window.requestAnimationFrame(scanLoop);
  }

  async function startCamera() {
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera trực tiếp cần HTTPS. Mở bằng https://<IP-Wi-Fi>:3443 (xem hướng dẫn) hoặc bấm “Chụp ảnh QR” để quét ảnh chụp."
      );
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      scannedRef.current = false;
      setReady(true);
      rafRef.current = window.requestAnimationFrame(scanLoop);
    } catch {
      setError("Không mở được camera. Kiểm tra quyền truy cập camera hoặc dùng “Chụp ảnh QR”.");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    scannedRef.current = false;
    setError(null);
    void startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const value = decodeFrame(bitmap, bitmap.width, bitmap.height, canvas);
      bitmap.close?.();
      if (value) {
        finish(value);
      } else {
        setError("Chưa nhận diện được mã QR. Hãy đưa mã QR lại gần camera hơn để hệ thống tự quét.");
      }
    } catch {
      setError("Không đọc được ảnh này. Vui lòng thử ảnh khác.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Quét mã QR hội viên"
    >
      <button type="button" aria-label="Đóng" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-lift sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Quét QR hội viên</h2>
              <p className="text-[11.5px] text-ink/45">Đưa mã QR lại gần camera — hệ thống tự nhận diện</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink/50 hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-ink">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          {!ready ? (
            <div className="absolute inset-0 grid place-items-center gap-2 p-6 text-center text-white/60">
              {starting ? (
                <span className="flex items-center gap-2 text-[13px]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang mở camera...
                </span>
              ) : (
                <span className="flex flex-col items-center gap-2 text-[13px]">
                  <CameraOff className="h-6 w-6" /> Camera chưa sẵn sàng
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-8 text-[11.5px] font-medium text-white/90">
                <ScanLine className="h-3.5 w-3.5" /> Đang tự động quét mã QR...
              </div>
            </>
          )}
        </div>

        {error ? (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">
            {error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Chụp ảnh QR
          </Button>
          <Button type="button" variant="dark" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink/40">
          Camera trực tiếp yêu cầu HTTPS. Khi test qua địa chỉ IP LAN dạng http, hãy dùng “Chụp ảnh QR”.
        </p>
      </div>
    </div>
  );
}
