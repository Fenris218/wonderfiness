"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const timerRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stopCamera() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }

  function finish(token: string) {
    stopCamera();
    onDetected(token);
    onClose();
  }

  function decodeLoop() {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
        if (code?.data) {
          finish(code.data);
          return;
        }
      }
    }
    timerRef.current = window.setTimeout(decodeLoop, 250);
  }

  async function startCamera() {
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera trực tiếp cần HTTPS (hoặc localhost). Bạn vẫn có thể bấm “Chụp ảnh QR” để quét ảnh chụp."
      );
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
      decodeLoop();
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
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(bitmap, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height);
      if (code?.data) {
        finish(code.data);
      } else {
        setError("Không tìm thấy mã QR trong ảnh. Hãy chụp lại rõ hơn.");
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
              <p className="text-[11.5px] text-ink/45">Đưa mã QR vào khung hình</p>
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
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
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
