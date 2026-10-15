import { addDays, type DateKey, type MonthKey, monthKeyOf } from "./date";

export const SPEND_CATEGORIES = [
  { id: "food", label: "식비" },
  { id: "cafe", label: "카페·간식" },
  { id: "shopping", label: "쇼핑" },
  { id: "transport", label: "교통" },
  { id: "etc", label: "기타" },
] as const;

export type SpendCategory = (typeof SPEND_CATEGORIES)[number]["id"];

export type DayRecord =
  | { status: "success" }
  | { status: "spent"; category?: SpendCategory; amount?: number };

export type RecordMap = Readonly<Record<DateKey, DayRecord>>;

export interface MonthStats {
  successDays: number;
  spentDays: number;
  spentAmount: number;
  savedAmount: number;
}

export const INTERSTITIAL_EVERY = 3;

export function setRecord(
  records: RecordMap,
  date: DateKey,
  record: DayRecord,
): RecordMap {
  return { ...records, [date]: record };
}

function isSuccess(records: RecordMap, date: DateKey): boolean {
  return records[date]?.status === "success";
}

function countBackwards(records: RecordMap, from: DateKey): number {
  let count = 0;
  let cursor = from;
  while (isSuccess(records, cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

// 오늘을 아직 기록하지 않았다면 어제까지 이어진 기록을 보여줘요.
export function currentStreak(records: RecordMap, today: DateKey): number {
  const start = records[today] === undefined ? addDays(today, -1) : today;
  return countBackwards(records, start);
}

export function longestStreak(records: RecordMap): number {
  return Object.keys(records)
    .filter((date) => isSuccess(records, date))
    .filter((date) => !isSuccess(records, addDays(date, -1)))
    .reduce((longest, start) => {
      let length = 0;
      let cursor = start;
      while (isSuccess(records, cursor)) {
        length += 1;
        cursor = addDays(cursor, 1);
      }
      return Math.max(longest, length);
    }, 0);
}

export function monthStats(
  records: RecordMap,
  month: MonthKey,
  dailyAverageSpend: number,
): MonthStats {
  const inMonth = Object.entries(records).filter(
    ([date]) => monthKeyOf(date) === month,
  );
  const successDays = inMonth.filter(([, r]) => r.status === "success").length;
  const spentRecords = inMonth
    .map(([, r]) => r)
    .filter((r): r is Extract<DayRecord, { status: "spent" }> => r.status === "spent");
  return {
    successDays,
    spentDays: spentRecords.length,
    spentAmount: spentRecords.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    savedAmount: successDays * dailyAverageSpend,
  };
}

export function shouldShowInterstitial(recordCount: number): boolean {
  return recordCount > 0 && recordCount % INTERSTITIAL_EVERY === 0;
}
