import React from 'react'
import { test, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LineChart from './LineChart'

const sample = [
  { cps: 10, accuracy: 95, created_at: '2024-01-01T00:00:00Z' },
  { cps: 12, accuracy: 90, created_at: '2024-01-02T00:00:00Z' },
  { cps: 14, accuracy: 98, created_at: '2024-01-03T00:00:00Z' },
]

test('renders polylines and shows tooltip on hover', () => {
  render(<LineChart data={sample} />)

  // 折れ線（2本）が存在
  const polylines = document.querySelectorAll('polyline')
  expect(polylines.length).toBe(2)

  // 最初のポイント付近にホバーしてツールチップのテキストを確認
  const svg = document.querySelector('svg') as SVGSVGElement
  expect(svg).toBeTruthy()

  // 透明なヒット領域はrectとして描画される
  // 透明ヒット領域（rect[fill="transparent"]）を取得
  const hit = svg.querySelector('rect[fill="transparent"]') as SVGRectElement
  expect(hit).toBeTruthy()

  // ツールチップ表示前は「正答率:」「文字/秒:」が無い
  expect(screen.queryByText(/正答率:/)).toBeNull()
  expect(screen.queryByText(/文字\/秒:/)).toBeNull()

  // 一旦最初のヒット領域にマウスを乗せてツールチップ表示
  fireEvent.mouseEnter(hit)

  // ツールチップ固有のラベルが出る
  expect(screen.getByText(/正答率:/)).toBeInTheDocument()
  expect(screen.getByText(/文字\/秒:/)).toBeInTheDocument()
})
