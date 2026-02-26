"use client"

import type { UserRole } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  // Login disabled for now – always render children
  return <>{children}</>
}
