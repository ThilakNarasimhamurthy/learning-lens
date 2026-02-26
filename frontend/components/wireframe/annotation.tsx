export function Annotation({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative">
      <span className="absolute -top-3 left-2 bg-background px-1.5 text-[10px] font-mono tracking-wider text-muted-foreground uppercase z-10">
        {label}
      </span>
      {children}
    </div>
  )
}

export function WireframeBox({
  children,
  className = "",
  dashed = false,
}: {
  children?: React.ReactNode
  className?: string
  dashed?: boolean
}) {
  return (
    <div
      className={`border ${dashed ? "border-dashed" : "border-solid"} border-border rounded-md p-4 ${className}`}
    >
      {children}
    </div>
  )
}

export function Placeholder({ height = "h-8", className = "" }: { height?: string; className?: string }) {
  return <div className={`bg-muted rounded ${height} ${className}`} />
}
