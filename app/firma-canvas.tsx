"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Signature, { getStroke, getSvgPathFromStroke, type SignatureRef } from "@uiw/react-signature";

type PuntosFirma = Record<string, number[][]>;

type FirmaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onImageChange?: (value: string) => void;
};

type VistaFirmaProps = {
  value: string;
  className?: string;
  readonly?: boolean;
};

const leerPuntos = (value: string): PuntosFirma => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as PuntosFirma;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return {};
  }
  return {};
};

const crearPuntosSerializados = (points: number[][], currentValue: string) => {
  const existentes = leerPuntos(currentValue);
  const nextIndex = Object.keys(existentes).length + 1;
  return JSON.stringify({
    ...existentes,
    [`path-${nextIndex}`]: points,
  });
};

const escalarPuntos = (puntos: PuntosFirma, ancho = 150, alto = 60, margen = 8) => {
  const todasLasPuntos = Object.values(puntos).flat();
  if (todasLasPuntos.length === 0) return puntos;

  const xs = todasLasPuntos.map(([x]) => x);
  const ys = todasLasPuntos.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const anchoOriginal = Math.max(maxX - minX, 1);
  const altoOriginal = Math.max(maxY - minY, 1);
  const escala = Math.min((ancho - margen * 2) / anchoOriginal, (alto - margen * 2) / altoOriginal);

  return Object.fromEntries(
    Object.entries(puntos).map(([clave, puntosPath]) => [
      clave,
      puntosPath.map(([x, y]) => [
        (x - minX) * escala + margen,
        (y - minY) * escala + margen,
      ]),
    ]),
  ) as PuntosFirma;
};

const svgToDataUrl = (svg: SVGSVGElement | null) => {
  if (!svg) return "";
  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
};

export function FirmaCanvas({ label, value, onChange, onImageChange }: FirmaProps) {
  const signatureRef = useRef<SignatureRef | null>(null);
  const [hasDrawn, setHasDrawn] = useState(Boolean(value));
  const puntos = useMemo(() => leerPuntos(value), [value]);

  useEffect(() => {
    setHasDrawn(Boolean(value));
  }, [value]);

  const clear = () => {
    signatureRef.current?.clear();
    setHasDrawn(false);
    onChange("");
  };

  return (
    <div className="signature-block">
      <div className="signature-block__label">{label}</div>
      <div className={`signature-wrapper ${hasDrawn ? "signature-canvas--success" : "signature-canvas--pending"}`}>
        <Signature
          key={value || "firma-vacia"}
          ref={signatureRef}
          defaultPoints={puntos}
          width="100%"
          height={210}
          onPointer={(points) => {
            if (!points.length) return;
            const nextValue = crearPuntosSerializados(points, value);
            setHasDrawn(true);
            onChange(nextValue);
            window.setTimeout(() => {
              onImageChange?.(svgToDataUrl(signatureRef.current?.svg || null));
            }, 0);
          }}
          className="signature-canvas signature-canvas--uiw"
          options={{ size: 4, thinning: 0.6, smoothing: 0.5, streamline: 0.6 }}
        />
      </div>
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

export function VistaFirma({ value, className = "", readonly = true }: VistaFirmaProps) {
  const puntos = useMemo(() => leerPuntos(value), [value]);
  const puntosEscalados = useMemo(() => escalarPuntos(puntos), [puntos]);
  const rutas = useMemo(
    () =>
      Object.values(puntosEscalados)
        .map((path) => getSvgPathFromStroke(getStroke(path, { size: 3, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })))
        .filter(Boolean),
    [puntosEscalados],
  );

  const firmaSvg = useMemo(() => {
    if (!rutas.length) return "";
    const contenido = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 60" width="150" height="60">
        ${rutas.map((d) => `<path d="${d}" fill="#111827" />`).join("")}
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(contenido)}`;
  }, [rutas]);

  return (
    <div className={`signature-preview ${className}`.trim()}>
      {firmaSvg ? <img src={firmaSvg} alt="Firma" className="firma-tabla-visual" /> : null}
    </div>
  );
}
