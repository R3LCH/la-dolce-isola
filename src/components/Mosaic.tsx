/**
 * Glazed majolica cells laid over an image; `revealMosaics` (motion.ts) lifts
 * them away in a diagonal wave. Hidden by default so the image shows when
 * JavaScript or motion is unavailable; the reveal switches it on.
 */
export function Mosaic({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div
      data-mosaic=""
      data-cols={cols}
      data-rows={rows}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <span key={i} className="mosaic-cell" />
      ))}
    </div>
  )
}
