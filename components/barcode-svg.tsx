"use client";

import React, { useMemo } from "react";

interface BarcodeSVGProps {
  value: string;
  width?: number;
  height?: number;
  barColor?: string;
  bgColor?: string;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Code 128 Subset B Pattern Mapping
 * Maps characters 32 (' ') through 127 to Code 128 patterns (widths of 6 elements: b1, s1, b2, s2, b3, s3)
 */
const CODE128_PATTERNS: Record<number, number[]> = {
  32: [2, 1, 2, 2, 2, 2], // ' '
  33: [2, 2, 2, 1, 2, 2], // '!'
  34: [2, 2, 2, 2, 2, 1], // '"'
  35: [1, 2, 1, 2, 2, 3], // '#'
  36: [1, 2, 1, 3, 2, 2], // '$'
  37: [1, 3, 1, 2, 2, 2], // '%'
  38: [1, 2, 2, 2, 1, 3], // '&'
  39: [1, 2, 2, 3, 1, 2], // '\''
  40: [1, 3, 2, 2, 1, 2], // '('
  41: [2, 2, 1, 2, 1, 3], // ')'
  42: [2, 2, 1, 3, 1, 2], // '*'
  43: [2, 3, 1, 2, 1, 2], // '+'
  44: [1, 1, 2, 2, 3, 2], // ','
  45: [1, 2, 2, 1, 3, 2], // '-'
  46: [1, 2, 2, 2, 3, 1], // '.'
  47: [1, 1, 3, 2, 2, 2], // '/'
  48: [1, 2, 3, 1, 2, 2], // '0'
  49: [1, 2, 3, 2, 2, 1], // '1'
  50: [2, 2, 3, 2, 1, 1], // '2'
  51: [2, 2, 1, 1, 3, 2], // '3'
  52: [2, 2, 1, 2, 3, 1], // '4'
  53: [2, 1, 3, 2, 1, 2], // '5'
  54: [2, 2, 3, 1, 1, 2], // '6'
  55: [3, 1, 2, 1, 3, 1], // '7'
  56: [3, 1, 1, 2, 2, 2], // '8'
  57: [3, 2, 1, 1, 2, 2], // '9'
  58: [3, 2, 2, 2, 1, 1], // ':'
  59: [2, 1, 2, 1, 2, 3], // ';'
  60: [2, 1, 2, 3, 2, 1], // '<'
  61: [2, 3, 2, 1, 2, 1], // '='
  62: [1, 1, 1, 3, 2, 3], // '>'
  63: [1, 3, 1, 1, 2, 3], // '?'
  64: [1, 3, 1, 3, 2, 1], // '@'
  65: [1, 1, 2, 3, 1, 3], // 'A'
  66: [1, 3, 2, 1, 1, 3], // 'B'
  67: [1, 3, 2, 3, 1, 1], // 'C'
  68: [2, 1, 1, 3, 1, 3], // 'D'
  69: [2, 3, 1, 1, 1, 3], // 'E'
  70: [2, 3, 1, 3, 1, 1], // 'F'
  71: [1, 1, 2, 1, 3, 3], // 'G'
  72: [1, 1, 2, 3, 3, 1], // 'H'
  73: [1, 3, 2, 1, 3, 1], // 'I'
  74: [1, 1, 3, 1, 2, 3], // 'J'
  75: [1, 1, 3, 3, 2, 1], // 'K'
  76: [1, 3, 3, 1, 2, 1], // 'L'
  77: [3, 1, 3, 1, 2, 1], // 'M'
  78: [2, 1, 1, 3, 3, 1], // 'N'
  79: [2, 3, 1, 1, 3, 1], // 'O'
  80: [2, 1, 3, 1, 1, 3], // 'P'
  81: [2, 1, 3, 3, 1, 1], // 'Q'
  82: [2, 1, 3, 1, 3, 1], // 'R'
  83: [3, 1, 1, 1, 2, 3], // 'S'
  84: [3, 1, 1, 3, 2, 1], // 'T'
  85: [3, 3, 1, 1, 2, 1], // 'U'
  86: [3, 1, 2, 1, 1, 3], // 'V'
  87: [3, 1, 2, 3, 1, 1], // 'W'
  88: [3, 3, 2, 1, 1, 1], // 'X'
  89: [3, 1, 4, 1, 1, 1], // 'Y'
  90: [2, 2, 1, 4, 1, 1], // 'Z'
  95: [1, 2, 3, 3, 1, 1], // '_'
};

// Start B Pattern: [2, 1, 1, 2, 1, 4]
const START_B = [2, 1, 1, 2, 1, 4];
// Stop Pattern: [2, 3, 3, 1, 1, 1, 2]
const STOP_PATTERN = [2, 3, 3, 1, 1, 1, 2];

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  value = "CUST-001",
  width = 200,
  height = 50,
  barColor = "#0f172a",
  bgColor = "#ffffff",
  showValue = true,
  className,
  style,
}) => {
  const bars = useMemo(() => {
    const uppercaseValue = (value || "RHPS-001").toUpperCase();
    const patternList: number[] = [...START_B];

    for (let i = 0; i < uppercaseValue.length; i++) {
      const code = uppercaseValue.charCodeAt(i);
      const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[65]; // Fallback to 'A'
      patternList.push(...pattern);
    }

    patternList.push(...STOP_PATTERN);

    // Convert widths into bar x-positions
    const result: { x: number; width: number }[] = [];
    let currentX = 10; // Left quiet zone

    for (let idx = 0; idx < patternList.length; idx++) {
      const w = patternList[idx];
      const isBar = idx % 2 === 0;
      if (isBar) {
        result.push({ x: currentX, width: w });
      }
      currentX += w;
    }

    const totalWidth = currentX + 10; // Right quiet zone
    return { bars: result, totalWidth };
  }, [value]);

  const barHeight = showValue ? height - 16 : height;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${bars.totalWidth} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{ display: "block", background: bgColor, borderRadius: 4, ...style }}
    >
      {/* Background */}
      <rect x={0} y={0} width={bars.totalWidth} height={height} fill={bgColor} />

      {/* Barcode Bars */}
      {bars.bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={4}
          width={bar.width}
          height={barHeight}
          fill={barColor}
        />
      ))}

      {/* Code Text Label */}
      {showValue && (
        <text
          x={bars.totalWidth / 2}
          y={height - 2}
          fill={barColor}
          fontSize={11.5}
          fontWeight="900"
          fontFamily="'JetBrains Mono', 'Consolas', 'Courier New', monospace"
          letterSpacing="0.08em"
          textAnchor="middle"
        >
          {value}
        </text>
      )}
    </svg>
  );
};

export default BarcodeSVG;
