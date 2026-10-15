import { CalendarCheck, Flame, type LucideIcon, Trophy } from "lucide-react";

import type { BadgeKind, MonthlyBadge } from "../domain/badges";
import { formatMonthDay } from "../domain/format";

const BADGE_ICONS: Record<BadgeKind, LucideIcon> = {
  days: CalendarCheck,
  streak: Flame,
  goal: Trophy,
};

interface BadgeGridProps {
  badges: MonthlyBadge[];
}

// 받은 배지는 색을 채우고 받은 날을, 못 받은 배지는 흐리게 진행도를 보여줘요.
export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="badge-grid">
      {badges.map((badge) => {
        const Icon = BADGE_ICONS[badge.kind];
        const isEarned = badge.earnedOn !== undefined;
        return (
          <div key={badge.id} className={`badge-item${isEarned ? " earned" : ""}`}>
            <div className={`badge-icon kind-${badge.kind}`}>
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <strong>{badge.label}</strong>
            <span>
              {isEarned
                ? formatMonthDay(badge.earnedOn as string)
                : `${badge.progress}/${badge.target}일`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
