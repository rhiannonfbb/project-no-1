"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import type { IdeaStatus } from "@/types"

const STATUS_CLASSES: Record<IdeaStatus, string> = {
  new:         "bg-gray-100 text-gray-700 hover:bg-gray-100",
  planned:     "bg-blue-100 text-blue-700 hover:bg-blue-100",
  in_progress: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  done:        "bg-green-100 text-green-700 hover:bg-green-100",
}

export function StatusBadge({ status }: { status: IdeaStatus }) {
  const { t } = useLanguage()
  return (
    <Badge variant="secondary" className={STATUS_CLASSES[status]}>
      {t(`status.${status}`)}
    </Badge>
  )
}
