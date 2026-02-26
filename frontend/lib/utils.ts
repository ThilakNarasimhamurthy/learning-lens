import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Remove duplicate items by id. Keeps first occurrence. */
export function dedupeById<T extends { id?: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    if (item?.id != null && !map.has(item.id)) {
      map.set(item.id, item)
    }
  }
  return Array.from(map.values())
}
