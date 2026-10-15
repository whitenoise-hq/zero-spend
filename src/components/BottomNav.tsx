import { CalendarDays, ChartColumn, House, type LucideIcon, Settings } from "lucide-react";

export type TabId = "home" | "calendar" | "report" | "settings";

const TABS: Array<{ id: TabId; label: string; Icon: LucideIcon }> = [
  { id: "home", label: "오늘", Icon: House },
  { id: "calendar", label: "달력", Icon: CalendarDays },
  { id: "report", label: "리포트", Icon: ChartColumn },
  { id: "settings", label: "설정", Icon: Settings },
];

interface BottomNavProps {
  current: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === current;
        return (
          <button
            key={id}
            type="button"
            className={isActive ? "active" : undefined}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
