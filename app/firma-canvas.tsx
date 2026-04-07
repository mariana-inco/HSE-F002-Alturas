"use client";

import React, { useEffect, useRef, useState } from "react";

type SignatureCanvasProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function SignatureCanvas({ label, value, onChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);
  const suppressRedraw = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(value));

  const paintSavedSignature = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || !value) return;
    const ratio = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    canvas.width = width * ratio;
    canvas.height = 210 * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = "210px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, 210);
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, width, 210);
      ctx.drawImage(image, 0, 0, width, 210);
    };
    image.src = value;
  };

  const resizeCanvas = (shouldPaintValue = true) => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ratio = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    canvas.width = width * ratio;
    canvas.height = 210 * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = "210px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    if (shouldPaintValue && value) paintSavedSignature();
  };

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setHasDrawn(Boolean(value));
    if (!drawing.current && !suppressRedraw.current) {
      resizeCanvas(true);
    }
  }, [value]);

  const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = pointerPosition(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = pointerPosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    const nextValue = canvas.toDataURL("image/png");
    setHasDrawn(true);
    onChange(nextValue);
  };

  const stop = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    suppressRedraw.current = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange("");
    resizeCanvas(false);
    window.setTimeout(() => {
      suppressRedraw.current = false;
    }, 0);
  };

  return (
    <div className="signature-block" ref={wrapperRef}>
      <div className="signature-block__label">{label}</div>
      <canvas
        ref={canvasRef}
        className={`signature-canvas ${hasDrawn ? "signature-canvas--success" : "signature-canvas--pending"}`}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
      />
      <div className={`signature-status ${hasDrawn ? "signature-status--success" : "signature-status--pending"}`}>
        {hasDrawn ? "✓ Firma registrada" : "⌛ Pendiente"}
      </div>
      <div className="signature-actions">
        <button type="button" className="btn btn--signature-clear" onClick={clear}>
          Limpiar firma
        </button>
      </div>
    </div>
  );
}
