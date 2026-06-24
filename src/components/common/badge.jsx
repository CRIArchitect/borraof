import { cn } from "../../util/cn";

/** Status badge. tone: active|inactive|admin|pending|rejected. */
export default function Badge({ tone = "inactive", children, className = "" }) {
  return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>;
}
