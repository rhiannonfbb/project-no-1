import { Badge } from "@/components/ui/badge"
import type { IdeaStatus } from "@/types"

const STATUS_CONFIG: Record<IdeaStatus, { label: string; variant: "secondary" | "default" | "outline" | "destructive"; className: string }> = {
  new:         { label: "New",         variant: "secondary", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  planned:     { label: "Planned",     variant: "default",   className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  in_progress: { label: "In Progress", variant: "default",   className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  done:        { label: "Done",        variant: "default",   className: "bg-green-100 text-green-700 hover:bg-green-100" },
}

export function StatusBadge({ status }: { status: IdeaStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export { STATUS_CONFIG }
