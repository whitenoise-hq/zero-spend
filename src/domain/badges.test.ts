import { describe, expect, it } from "vitest";

import { monthlyBadges, newlyEarnedBadges } from "./badges";
import type { DayRecord, RecordMap } from "./records";

const success: DayRecord = { status: "success" };
const spent: DayRecord = { status: "spent" };

function successDays(month: string, days: number[]): RecordMap {
  return Object.fromEntries(
    days.map((day) => [`${month}-${String(day).padStart(2, "0")}`, success]),
  );
}

function find(badges: ReturnType<typeof monthlyBadges>, id: string) {
  const badge = badges.find((b) => b.id === id);
  if (!badge) throw new Error(`badge ${id} not found`);
  return badge;
}

describe("monthlyBadges", () => {
  it("이번 달 무지출 일수 배지는 해당 일수를 채운 날짜에 받아요", () => {
    const records = successDays("2026-10", [1, 4, 9]);
    const badges = monthlyBadges(records, "2026-10", 10);
    expect(find(badges, "days-3")).toMatchObject({ earnedOn: "2026-10-09", progress: 3 });
    expect(find(badges, "days-5")).toMatchObject({ earnedOn: undefined, progress: 3 });
  });

  it("연속 배지는 그 달 안에서 이어진 날만 세요", () => {
    const records: RecordMap = {
      ...successDays("2026-09", [29, 30]),
      ...successDays("2026-10", [1, 2, 3]),
      "2026-10-04": spent,
      ...successDays("2026-10", [5, 6]),
    };
    const badges = monthlyBadges(records, "2026-10", 10);
    expect(find(badges, "streak-3")).toMatchObject({ earnedOn: "2026-10-03", progress: 3 });
    expect(find(badges, "streak-7").earnedOn).toBeUndefined();
  });

  it("기록이 없는 날도 연속을 끊어요", () => {
    const records = successDays("2026-10", [1, 2, 4, 5]);
    expect(find(monthlyBadges(records, "2026-10", 10), "streak-3").progress).toBe(2);
  });

  it("목표 달성 배지는 설정한 목표 일수를 채운 날에 받아요", () => {
    const records = successDays("2026-10", [1, 2, 3, 4]);
    expect(find(monthlyBadges(records, "2026-10", 4), "goal")).toMatchObject({
      earnedOn: "2026-10-04",
      progress: 4,
      target: 4,
    });
  });

  it("다른 달 기록은 세지 않아요 (매달 초기화)", () => {
    const records = successDays("2026-09", [1, 2, 3, 4, 5]);
    const badges = monthlyBadges(records, "2026-10", 10);
    expect(badges.every((b) => b.earnedOn === undefined && b.progress === 0)).toBe(true);
  });

  it("진행도는 목표치를 넘지 않아요", () => {
    const records = successDays("2026-10", [1, 2, 3, 4, 5, 6]);
    expect(find(monthlyBadges(records, "2026-10", 10), "days-3").progress).toBe(3);
  });
});

describe("newlyEarnedBadges", () => {
  it("기록 전후를 비교해서 새로 받은 배지만 돌려줘요", () => {
    const before = successDays("2026-10", [1, 2]);
    const after = { ...before, ...successDays("2026-10", [3]) };
    const earned = newlyEarnedBadges(before, after, "2026-10", 3);
    expect(earned.map((b) => b.id)).toEqual(["days-3", "streak-3", "goal"]);
  });

  it("새로 받은 게 없으면 빈 배열이에요", () => {
    const before = successDays("2026-10", [1]);
    expect(newlyEarnedBadges(before, before, "2026-10", 10)).toEqual([]);
  });
});
