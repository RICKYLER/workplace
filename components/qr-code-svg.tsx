"use client";

import React, { useMemo } from "react";
import QRCode from "qrcode";

interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  centerIcon?: string;
}

/**
 * Pure React SVG QR Code Generator powered by standard QR engine.
 * Generates Reed-Solomon Error Corrected QR matrices scannable by all mobile devices.
 */
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 128,
  bgColor = "#FFFFFF",
  fgColor = "#0F172A",
  includeMargin = true,
  title,
  className,
  style,
  centerIcon,
}) => {
  const { pathD, viewBoxSize } = useMemo(() => {
    try {
      const targetValue = value && value.trim() ? value.trim() : "https://rhps-pianos.ph";
      const qr = QRCode.create(targetValue, {
        errorCorrectionLevel: "M",
      });
      const numModules = qr.modules.size;
      const margin = includeMargin ? 2 : 0;
      const totalSize = numModules + margin * 2;

      let d = "";
      for (let r = 0; r < numModules; r++) {
        for (let c = 0; c < numModules; c++) {
          if (qr.modules.get(r, c)) {
            const x = c + margin;
            const y = r + margin;
            d += `M${x},${y}h1v1h-1z `;
          }
        }
      }

      return { pathD: d, viewBoxSize: totalSize };
    } catch (err) {
      console.error("QR Code Generation Error:", err);
      return { pathD: "", viewBoxSize: 25 };
    }
  }, [value, includeMargin]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      style={{ display: "block", background: bgColor, borderRadius: 8, ...style }}
    >
      {title && <title>{title}</title>}
      {/* Background */}
      <rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill={bgColor} rx={1} />

      {/* Modules */}
      <path d={pathD} fill={fgColor} />

      {/* Center Icon Overlay (Optional) */}
      {centerIcon && (
        <g transform={`translate(${viewBoxSize / 2 - 2.5}, ${viewBoxSize / 2 - 2.5})`}>
          <rect x={-0.5} y={-0.5} width={6} height={6} fill={bgColor} rx={1.2} />
          <text
            x={2.5}
            y={3.8}
            fontSize={3.8}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {centerIcon}
          </text>
        </g>
      )}
    </svg>
  );
};

export default QRCodeSVG;
