import { z } from "zod";

import { type DateKey, isValidDateKey } from "./date";
import {
  type DayRecord,
  type RecordMap,
  SPEND_CATEGORIES,
  setRecord,
} from "./records";

export interface Settings {
  dailyAverageSpend: number;
  monthlyGoal: number;
}

// 저녁 기록 알림 동의 상태예요. 실제 발송은 토스 콘솔의 반복 발송이 해요.
export interface ReminderState {
  prompted: boolean;
  agreed: boolean;
}

export interface AppState {
  version: 1;
  nickname?: string;
  records: RecordMap;
  settings: Settings;
  recordCount: number;
  reminder: ReminderState;
}

const MAX_DAILY_SPEND = 10_000_000;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 4;

export const DEFAULT_STATE: AppState = {
  version: 1,
  records: {},
  settings: { dailyAverageSpend: 20000, monthlyGoal: 10 },
  recordCount: 0,
  reminder: { prompted: false, agreed: false },
};

const categoryIds = SPEND_CATEGORIES.map((c) => c.id) as [string, ...string[]];

const dayRecordSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success") }),
  z.object({
    status: z.literal("spent"),
    category: z.enum(categoryIds).optional(),
    amount: z.number().int().min(0).max(MAX_DAILY_SPEND).optional(),
  }),
]);

const reminderSchema = z.object({ prompted: z.boolean(), agreed: z.boolean() });

const settingsSchema = z.object({
  dailyAverageSpend: z.number().int().min(0).max(MAX_DAILY_SPEND),
  monthlyGoal: z.number().int().min(1).max(31),
});

function parseRecords(input: unknown): RecordMap {
  if (typeof input !== "object" || input === null) return {};
  return Object.fromEntries(
    Object.entries(input).flatMap(([date, value]) => {
      const record = dayRecordSchema.safeParse(value);
      return isValidDateKey(date) && record.success
        ? [[date, record.data as DayRecord]]
        : [];
    }),
  );
}

// 저장 데이터 일부가 깨져도 나머지 기록은 지켜요. 깨진 부분만 기본값으로 돌려요.
export function parseAppState(raw: string | null): AppState {
  if (raw === null) return DEFAULT_STATE;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_STATE;
  }
  if (typeof data !== "object" || data === null) return DEFAULT_STATE;
  const source = data as Record<string, unknown>;
  const nickname =
    typeof source.nickname === "string" && isValidNickname(source.nickname)
      ? source.nickname
      : undefined;
  const settings = settingsSchema.safeParse(source.settings);
  const recordCount = z.number().int().min(0).safeParse(source.recordCount);
  const reminder = reminderSchema.safeParse(source.reminder);
  return {
    version: 1,
    ...(nickname ? { nickname } : {}),
    records: parseRecords(source.records),
    settings: settings.success ? settings.data : DEFAULT_STATE.settings,
    recordCount: recordCount.success ? recordCount.data : 0,
    reminder: reminder.success ? reminder.data : DEFAULT_STATE.reminder,
  };
}

export function serializeAppState(state: AppState): string {
  return JSON.stringify(state);
}

function normalizeRecord(record: DayRecord): DayRecord {
  if (record.status !== "spent" || record.amount === undefined) return record;
  return { ...record, amount: clamp(record.amount, 0, MAX_DAILY_SPEND) };
}

export function recordToday(
  state: AppState,
  date: DateKey,
  record: DayRecord,
): AppState {
  return {
    ...state,
    records: setRecord(state.records, date, normalizeRecord(record)),
    recordCount: state.recordCount + 1,
  };
}

export function saveProfile(
  state: AppState,
  nickname: string,
  settings: Partial<Settings>,
): AppState {
  return updateSettings(setNickname(state, nickname), settings);
}

export function hasOnboarded(state: AppState): boolean {
  return state.nickname !== undefined;
}

// 이모지처럼 두 칸을 차지하는 글자도 한 글자로 세요.
function nicknameLength(value: string): number {
  return [...value.trim()].length;
}

export function isValidNickname(input: string): boolean {
  const length = nicknameLength(input);
  return length >= NICKNAME_MIN_LENGTH && length <= NICKNAME_MAX_LENGTH;
}

export function setNickname(state: AppState, input: string): AppState {
  if (!isValidNickname(input)) return state;
  return { ...state, nickname: input.trim() };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function updateSettings(
  state: AppState,
  patch: Partial<Settings>,
): AppState {
  const merged = { ...state.settings, ...patch };
  return {
    ...state,
    settings: {
      dailyAverageSpend: clamp(merged.dailyAverageSpend, 0, MAX_DAILY_SPEND),
      monthlyGoal: clamp(merged.monthlyGoal, 1, 31),
    },
  };
}

export function shouldPromptReminder(state: AppState): boolean {
  return state.recordCount > 0 && !state.reminder.prompted;
}

export function markReminderPrompted(state: AppState): AppState {
  return { ...state, reminder: { ...state.reminder, prompted: true } };
}

export function setReminderAgreed(state: AppState, agreed: boolean): AppState {
  return { ...state, reminder: { prompted: true, agreed } };
}
