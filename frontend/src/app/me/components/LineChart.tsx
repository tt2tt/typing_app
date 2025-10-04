"use client";

import { useMemo, useState } from "react";

type RecordItem = { cps: number; accuracy: number; created_at: string };

// 簡易SVGラインチャートコンポーネント（cpsとaccuracyの2系列表示）
export default function LineChart({ data }: { data: RecordItem[] }) {
  const width = 640; // SVGの幅
  const height = 300; // SVGの高さ
  const paddingLeft = 64; // 左余白
  const paddingRight = 56; // 右余白
  const paddingTop = 28; // 上余白
  const paddingBottom = 56; // 下余白

  // ホバー中のインデックス（ポイント/縦帯）
  const [hovered, setHovered] = useState<number | null>(null);

  // 折れ線グラフの座標計算をメモ化
  const points = useMemo(() => {
    const n = data.length || 1; // データ数
    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;
    // x座標を等間隔で計算
    const xs = data.map((_, i) => paddingLeft + (i * plotW) / Math.max(1, n - 1));

    // 各系列の値を抽出
    const cpsVals = data.map(d => d.cps);
    const accVals = data.map(d => d.accuracy);

    // 軸の最大値（指定通り）
    const cpsMax = 20; // 右軸
    const accMax = 100; // 左軸

    // y座標スケール関数（上=paddingTop, 下=height - paddingBottom）
    const yScale = (v: number, max: number) => paddingTop + (plotH * (1 - v / max));

    // y座標配列
    const cpsYs = cpsVals.map(v => yScale(Math.min(v, cpsMax), cpsMax));
    const accYs = accVals.map(v => yScale(Math.min(v, accMax), accMax));

    // 折れ線の座標文字列生成
    const cpsPts = xs.map((x, i) => `${x},${cpsYs[i]}`).join(" ");
    const accPts = xs.map((x, i) => `${x},${accYs[i]}`).join(" ");

    // x方向のステップ（ヒット領域用）
    const stepX = n > 1 ? plotW / (n - 1) : plotW;

    return { xs, cpsPts, accPts, cpsYs, accYs, cpsMax, accMax, plotW, plotH, stepX };
  }, [data]);

  const nTotal = data.length;

  return (
    <svg
      width={width}
      height={height}
      className="border border-gray-200 rounded bg-white"
      onMouseLeave={() => setHovered(null)}
    >
      {/* プロット領域の枠 */}
      <rect x={paddingLeft} y={paddingTop} width={points.plotW} height={points.plotH} fill="none" stroke="#e5e7eb" />

      {/* 左縦軸（accuracy 0-100）目盛り */}
      {[0, 20, 40, 60, 80, 100].map((v) => {
        const y = paddingTop + (points.plotH * (1 - v / 100));
        return (
          <g key={`l-${v}`}>
            <line x1={paddingLeft - 4} y1={y} x2={paddingLeft} y2={y} stroke="#6b7280" />
            <text x={paddingLeft - 8} y={y + 4} fontSize="12" fill="#111" textAnchor="end">{v}</text>
          </g>
        );
      })}
      <text
        x={paddingLeft - 36}
        y={paddingTop + points.plotH / 2}
        fill="#111"
        fontSize="12"
        textAnchor="middle"
        transform={`rotate(-90 ${paddingLeft - 36} ${paddingTop + points.plotH / 2})`}
      >
        正答率 (%)
      </text>

      {/* 右縦軸（cps 0-20）目盛り */}
      {[0, 5, 10, 15, 20].map((v) => {
        const y = paddingTop + (points.plotH * (1 - v / 20));
        return (
          <g key={`r-${v}`}>
            <line x1={width - paddingRight} y1={y} x2={width - paddingRight + 4} y2={y} stroke="#6b7280" />
            <text x={width - paddingRight + 8} y={y + 4} fontSize="12" fill="#111" textAnchor="start">{v}</text>
          </g>
        );
      })}
      <text
        x={width - paddingRight + 32}
        y={paddingTop + points.plotH / 2}
        fill="#111"
        fontSize="12"
        textAnchor="middle"
        transform={`rotate(-90 ${width - paddingRight + 42} ${paddingTop + points.plotH / 2})`}
      >
        　文字数
      </text>

      {/* 横軸（回数）目盛り */}
      {points.xs.map((x: number, i: number) => (
        <g key={`b-${i}`}>
          <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 4} stroke="#6b7280" />
          <text x={x} y={height - paddingBottom + 16} fontSize="12" fill="#111" textAnchor="middle">{nTotal - i}回前</text>
        </g>
      ))}

      {/* 折れ線グラフ本体 */}
      {/* accuracy: 左軸（緑）、cps: 右軸（青） */}
      <polyline fill="none" stroke="#16a34a" strokeWidth={2} points={points.accPts} />
      <polyline fill="none" stroke="#2563eb" strokeWidth={2} points={points.cpsPts} />

      {/* データポイント（ホバーで強調） */}
      {data.map((d, i) => (
        <g key={`pt-${i}`}>
          {/* accuracy の点 */}
          <circle
            cx={points.xs[i]}
            cy={points.accYs[i]}
            r={hovered === i ? 5 : 3}
            fill="#16a34a"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          {/* cps の点 */}
          <circle
            cx={points.xs[i]}
            cy={points.cpsYs[i]}
            r={hovered === i ? 5 : 3}
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </g>
      ))}

      {/* ホバー検出用の透明縦帯とガイドライン */}
      {data.map((_, i) => {
        const x = points.xs[i];
        const xPrev = i === 0 ? paddingLeft : (points.xs[i - 1] + x) / 2;
        const xNext = i === data.length - 1 ? (width - paddingRight) : (x + points.xs[i + 1]) / 2;
        return (
          <g key={`hit-${i}`}>
            {/* ガイドライン（ホバー時のみ表示） */}
            {hovered === i && (
              <line
                x1={x}
                x2={x}
                y1={paddingTop}
                y2={height - paddingBottom}
                stroke="#d1d5db"
                strokeDasharray="4 4"
              />
            )}
            {/* 透明ヒット領域 */}
            <rect
              x={xPrev}
              y={paddingTop}
              width={Math.max(2, xNext - xPrev)}
              height={points.plotH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          </g>
        );
      })}

      {/* ツールチップ（ホバー時） */}
      {hovered !== null && data[hovered] && (() => {
        const i = hovered;
        const x0 = points.xs[i];
        const tipW = 160;
        const tipH = 56;
        const tipX = Math.min(
          Math.max(x0 - tipW / 2, paddingLeft + 4),
          width - paddingRight - tipW - 4
        );
        const tipY = paddingTop + 8;
        const accVal = data[i].accuracy;
        const cpsVal = data[i].cps;
        return (
          <g>
            <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={8} fill="#ffffff" stroke="#9ca3af" />
            <text x={tipX + 8} y={tipY + 16} fontSize="12" fill="#111" fontWeight={600}>
              {nTotal - i}回前
            </text>
            <text x={tipX + 8} y={tipY + 34} fontSize="12" fill="#16a34a">
              正答率: {accVal.toFixed(1)}%
            </text>
            <text x={tipX + 8} y={tipY + 50} fontSize="12" fill="#2563eb">
              文字/秒: {cpsVal.toFixed(2)}
            </text>
          </g>
        );
      })()}

      {/* 凡例（下部に配置して重なり回避） */}
      <g>
        <line x1={paddingLeft} y1={height - paddingBottom + 32} x2={paddingLeft + 16} y2={height - paddingBottom + 32} stroke="#16a34a" strokeWidth={2} />
        <text x={paddingLeft + 20} y={height - paddingBottom + 36} fontSize="12" fill="#111">正答率</text>
        <line x1={paddingLeft + 96} y1={height - paddingBottom + 32} x2={paddingLeft + 112} y2={height - paddingBottom + 32} stroke="#2563eb" strokeWidth={2} />
        <text x={paddingLeft + 116} y={height - paddingBottom + 36} fontSize="12" fill="#111">1秒間の入力文字数</text>
      </g>
    </svg>
  );
}
