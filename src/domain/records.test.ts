import { describe, expect, it } from "vitest";

import {
  type DayRecord,
  type RecordMap,
  currentStreak,
  longestStreak,
  monthStats,
  setRecord,
  shouldShowInterstitial,
  willShowInterstitialOnNextRecord,
} from "./records";

const success: DayRecord = { status: "success" };
const spent: DayRecord = { status: "spent", category: "food", amount: 8000 };

function mapOf(entries: Array<[string, DayRecord]>): RecordMap {
  return Object.fromEntries(entries);
}

describe("setRecord", () => {
  it("기존 객체를 바꾸지 않고 새 객체를 돌려줘요", () => {
    const before = mapOf([["2026-10-14", success]]);
    const after = setRecord(before, "2026-10-15", spent);
    expect(before).toEqual(mapOf([["2026-10-14", success]]));
    expect(after["2026-10-15"]).toEqual(spent);
    expect(after).not.toBe(before);
  });
});

describe("currentStreak", () => {
  it("오늘 성공까지 이어진 연속 일수를 세요", () => {
    const records = mapOf([
      ["2026-10-13", success],
      ["2026-10-14", success],
      ["2026-10-15", success],
    ]);
    expect(currentStreak(records, "2026-10-15")).toBe(3);
  });

  it("오늘 아직 기록 전이면 어제까지의 연속 일수를 보여줘요", () => {
    const records = mapOf([
      ["2026-10-13", success],
      ["2026-10-14", success],
    ]);
    expect(currentStreak(records, "2026-10-15")).toBe(2);
  });

  it("오늘 썼으면 0이에요", () => {
    const records = mapOf([
      ["2026-10-14", success],
      ["2026-10-15", spent],
    ]);
    expect(currentStreak(records, "2026-10-15")).toBe(0);
  });

  it("중간에 빈 날이 있으면 거기서 끊겨요", () => {
    const records = mapOf([
      ["2026-10-12", success],
      ["2026-10-14", success],
    ]);
    expect(currentStreak(records, "2026-10-15")).toBe(1);
  });

  it("기록이 없으면 0이에요", () => {
    expect(currentStreak({}, "2026-10-15")).toBe(0);
  });
});

describe("longestStreak", () => {
  it("전체 기록 중 가장 긴 연속 성공을 찾아요", () => {
    const records = mapOf([
      ["2026-09-29", success],
      ["2026-09-30", success],
      ["2026-10-01", success],
      ["2026-10-02", spent],
      ["2026-10-03", success],
    ]);
    expect(longestStreak(records)).toBe(3);
  });

  it("기록이 없으면 0이에요", () => {
    expect(longestStreak({})).toBe(0);
  });
});

describe("monthStats", () => {
  it("해당 월의 성공 일수, 쓴 날, 쓴 금액, 아낀 금액을 계산해요", () => {
    const records = mapOf([
      ["2026-09-30", success],
      ["2026-10-01", success],
      ["2026-10-02", spent],
      ["2026-10-03", success],
      ["2026-10-04", { status: "spent" }],
    ]);
    expect(monthStats(records, "2026-10", 15000)).toEqual({
      successDays: 2,
      spentDays: 2,
      spentAmount: 8000,
      savedAmount: 30000,
    });
  });
});

describe("shouldShowInterstitial", () => {
  it("기록 3번마다 한 번 전면 광고를 보여줘요", () => {
    expect(shouldShowInterstitial(1)).toBe(false);
    expect(shouldShowInterstitial(2)).toBe(false);
    expect(shouldShowInterstitial(3)).toBe(true);
    expect(shouldShowInterstitial(6)).toBe(true);
    expect(shouldShowInterstitial(0)).toBe(false);
  });
});

describe("willShowInterstitialOnNextRecord", () => {
  it("다음 기록에서 광고가 나오는지 미리 알려줘요", () => {
    expect(willShowInterstitialOnNextRecord(0)).toBe(false);
    expect(willShowInterstitialOnNextRecord(2)).toBe(true);
    expect(willShowInterstitialOnNextRecord(3)).toBe(false);
    expect(willShowInterstitialOnNextRecord(5)).toBe(true);
  });
});
