import { type DateKey, daysInMonth, type MonthKey } from "./date";
import type { RecordMap } from "./records";

export type BadgeKind = "days" | "streak" | "goal";

export interface MonthlyBadge {
  id: string;
  kind: BadgeKind;
  label: string;
  target: number;
  progress: number;
  earnedOn?: DateKey;
}

const DAY_TARGETS = [3, 5, 10, 15, 20, 25] as const;
const STREAK_TARGETS = [3, 7, 14, 21] as const;

interface MonthTimeline {
  // n번째 무지출 성공일(1부터)이 된 날짜
  nthSuccessDate: DateKey[];
  // 연속 n일을 처음 달성한 날짜
  firstStreakDate: Map<number, DateKey>;
  successCount: number;
  bestStreak: number;
}

// 그 달 1일부터 말일까지 순서대로 훑어요. 기록이 없거나 쓴 날은 연속이 끊겨요.
function buildTimeline(records: RecordMap, month: MonthKey): MonthTimeline {
  const nthSuccessDate: DateKey[] = [];
  const firstStreakDate = new Map<number, DateKey>();
  let run = 0;
  let bestStreak = 0;
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    if (records[date]?.status !== "success") {
      run = 0;
      continue;
    }
    nthSuccessDate.push(date);
    run += 1;
    bestStreak = Math.max(bestStreak, run);
    if (!firstStreakDate.has(run)) firstStreakDate.set(run, date);
  }
  return { nthSuccessDate, firstStreakDate, successCount: nthSuccessDate.length, bestStreak };
}

function daysBadge(timeline: MonthTimeline, target: number, kind: BadgeKind): MonthlyBadge {
  return {
    id: kind === "goal" ? "goal" : `days-${target}`,
    kind,
    label: kind === "goal" ? "목표 달성" : `이번 달 ${target}일`,
    target,
    progress: Math.min(timeline.successCount, target),
    earnedOn: timeline.nthSuccessDate[target - 1],
  };
}

function streakBadge(timeline: MonthTimeline, target: number): MonthlyBadge {
  return {
    id: `streak-${target}`,
    kind: "streak",
    label: `${target}일 연속`,
    target,
    progress: Math.min(timeline.bestStreak, target),
    earnedOn: timeline.firstStreakDate.get(target),
  };
}

// 배지는 기록에서 바로 계산해서, 달이 바뀌면 자연스럽게 새로 시작해요.
export function monthlyBadges(
  records: RecordMap,
  month: MonthKey,
  monthlyGoal: number,
): MonthlyBadge[] {
  const timeline = buildTimeline(records, month);
  return [
    ...DAY_TARGETS.map((target) => daysBadge(timeline, target, "days")),
    ...STREAK_TARGETS.map((target) => streakBadge(timeline, target)),
    daysBadge(timeline, monthlyGoal, "goal"),
  ];
}

export function newlyEarnedBadges(
  before: RecordMap,
  after: RecordMap,
  month: MonthKey,
  monthlyGoal: number,
): MonthlyBadge[] {
  const earnedBefore = new Set(
    monthlyBadges(before, month, monthlyGoal)
      .filter((badge) => badge.earnedOn)
      .map((badge) => badge.id),
  );
  return monthlyBadges(after, month, monthlyGoal).filter(
    (badge) => badge.earnedOn && !earnedBefore.has(badge.id),
  );
}
