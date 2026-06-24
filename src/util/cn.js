// Tiny classnames helper — joins truthy class fragments.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
