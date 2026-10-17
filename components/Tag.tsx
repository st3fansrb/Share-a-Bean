export function Synthetic({ children = "synthetic" }: { children?: string }) {
  return <span className="tag">{children}</span>;
}
