"use client"

import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"

export type ViewType = "overview" | "student" | "teacher"

const navItems: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "student", label: "Student Workflow", icon: GraduationCap },
  { id: "teacher", label: "Teacher Dashboard", icon: Users },
]

interface AppSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed: boolean
  onToggle: () => void
  completedStudentDemo: boolean
}

export function AppSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggle,
  completedStudentDemo,
}: AppSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col z-30 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
            EduFlow AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 pt-2 pb-1">
            Navigation
          </span>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeView === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
            {!collapsed && item.id === "student" && completedStudentDemo && (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </button>
        ))}
      </nav>

      {/* Demo Progress (when not collapsed) */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/50 p-3 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
              Demo Progress
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${completedStudentDemo ? "bg-emerald-500" : activeView === "student" ? "bg-primary animate-pulse" : "bg-sidebar-foreground/20"}`} />
                <span className="text-xs text-sidebar-foreground/70">Student journey</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${completedStudentDemo && activeView === "teacher" ? "bg-primary animate-pulse" : completedStudentDemo ? "bg-sidebar-foreground/20" : "bg-sidebar-foreground/20"}`} />
                <span className="text-xs text-sidebar-foreground/70">Teacher review</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
