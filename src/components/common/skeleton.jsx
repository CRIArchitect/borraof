/** Shimmer skeleton placeholder. */
export default function Skeleton({ w = "100%", h = 14, r = 6, className = "", style = {} }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ display: "block", width: w, height: h, borderRadius: r, ...style }}
      aria-hidden
    />
  );
}
