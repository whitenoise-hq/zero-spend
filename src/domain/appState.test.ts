import { describe, expect, it } from "vitest";

import {
  DEFAULT_STATE,
  hasOnboarded,
  isValidNickname,
  markReminderPrompted,
  parseAppState,
  recordToday,
  saveProfile,
  serializeAppState,
  setNickname,
  setReminderAgreed,
  shouldPromptReminder,
  updateSettings,
} from "./appState";

describe("parseAppState", () => {
  it("저장된 값이 없으면 기본 상태를 돌려줘요", () => {
    expect(parseAppState(null)).toEqual(DEFAULT_STATE);
  });

  it("깨진 JSON이면 기본 상태를 돌려줘요", () => {
    expect(parseAppState("{oops")).toEqual(DEFAULT_STATE);
  });

  it("JSON 객체가 아니면 기본 상태를 돌려줘요", () => {
    expect(parseAppState("123")).toEqual(DEFAULT_STATE);
  });

  it("잘못된 기록 하나 때문에 나머지 기록을 잃지 않아요", () => {
    const raw = JSON.stringify({
      version: 1,
      nickname: "절약왕",
      records: {
        "2026-13-40": { status: "success" },
        "2026-10-14": { status: "spent", amount: 99_999_999_999 },
        "2026-10-15": { status: "success" },
      },
      settings: { dailyAverageSpend: 20000, monthlyGoal: 10 },
      recordCount: 3,
    });
    const parsed = parseAppState(raw);
    expect(parsed.nickname).toBe("절약왕");
    expect(parsed.records).toEqual({ "2026-10-15": { status: "success" } });
    expect(parsed.recordCount).toBe(3);
  });

  it("설정이 깨져 있으면 설정만 기본값으로 돌려요", () => {
    const raw = JSON.stringify({
      version: 1,
      nickname: "절약왕",
      records: { "2026-10-15": { status: "success" } },
      settings: { dailyAverageSpend: "많이", monthlyGoal: 10 },
      recordCount: 1,
    });
    const parsed = parseAppState(raw);
    expect(parsed.settings).toEqual(DEFAULT_STATE.settings);
    expect(parsed.records["2026-10-15"]).toEqual({ status: "success" });
  });

  it("직렬화한 값을 그대로 복원해요", () => {
    const state = recordToday(DEFAULT_STATE, "2026-10-15", { status: "success" });
    expect(parseAppState(serializeAppState(state))).toEqual(state);
  });
});

describe("recordToday", () => {
  it("기록을 추가하고 기록 횟수를 올려요", () => {
    const next = recordToday(DEFAULT_STATE, "2026-10-15", {
      status: "spent",
      category: "cafe",
      amount: 4500,
    });
    expect(next.records["2026-10-15"]).toEqual({
      status: "spent",
      category: "cafe",
      amount: 4500,
    });
    expect(next.recordCount).toBe(1);
    expect(DEFAULT_STATE.recordCount).toBe(0);
  });

  it("너무 큰 금액은 최대값으로 잘라서 저장해요", () => {
    const next = recordToday(DEFAULT_STATE, "2026-10-15", {
      status: "spent",
      amount: 99_999_999_999,
    });
    expect(next.records["2026-10-15"]).toEqual({ status: "spent", amount: 10_000_000 });
  });
});

describe("saveProfile", () => {
  it("닉네임과 설정을 한 번에 바꿔요", () => {
    const next = saveProfile(DEFAULT_STATE, "절약왕", { dailyAverageSpend: 30000, monthlyGoal: 20 });
    expect(next.nickname).toBe("절약왕");
    expect(next.settings).toEqual({ dailyAverageSpend: 30000, monthlyGoal: 20 });
  });
});

describe("setNickname", () => {
  it("앞뒤 공백을 지우고 저장해요", () => {
    const next = setNickname(DEFAULT_STATE, "  절약왕  ");
    expect(next.nickname).toBe("절약왕");
    expect(DEFAULT_STATE.nickname).toBeUndefined();
  });

  it("2~4글자만 받아요", () => {
    expect(isValidNickname("가")).toBe(false);
    expect(isValidNickname("가나")).toBe(true);
    expect(isValidNickname("가나다라")).toBe(true);
    expect(isValidNickname("가나다라마")).toBe(false);
    expect(isValidNickname(" 가 ")).toBe(false);
  });

  it("규칙에 안 맞으면 상태를 바꾸지 않아요", () => {
    expect(setNickname(DEFAULT_STATE, "   ")).toBe(DEFAULT_STATE);
    expect(setNickname(DEFAULT_STATE, "가")).toBe(DEFAULT_STATE);
    expect(setNickname(DEFAULT_STATE, "가나다라마")).toBe(DEFAULT_STATE);
  });

  it("저장된 닉네임이 규칙에 안 맞으면 기본 상태로 읽어요", () => {
    const broken = serializeAppState({ ...DEFAULT_STATE, nickname: "가나다라마바" });
    expect(parseAppState(broken)).toEqual(DEFAULT_STATE);
  });

  it("닉네임이 있어야 시작한 것으로 봐요", () => {
    expect(hasOnboarded(DEFAULT_STATE)).toBe(false);
    expect(hasOnboarded(setNickname(DEFAULT_STATE, "절약왕"))).toBe(true);
  });

  it("닉네임도 저장했다가 복원해요", () => {
    const state = setNickname(DEFAULT_STATE, "절약왕");
    expect(parseAppState(serializeAppState(state)).nickname).toBe("절약왕");
  });
});

describe("reminder", () => {
  it("처음에는 묻지도, 동의하지도 않은 상태예요", () => {
    expect(DEFAULT_STATE.reminder).toEqual({ prompted: false, agreed: false });
  });

  it("물어봤다고 표시하면 다시 자동으로 묻지 않아요", () => {
    const next = markReminderPrompted(DEFAULT_STATE);
    expect(next.reminder.prompted).toBe(true);
    expect(shouldPromptReminder(next)).toBe(false);
  });

  it("첫 기록을 한 뒤, 아직 묻지 않았으면 물어봐요", () => {
    expect(shouldPromptReminder(DEFAULT_STATE)).toBe(false);
    const recorded = recordToday(DEFAULT_STATE, "2026-10-15", { status: "success" });
    expect(shouldPromptReminder(recorded)).toBe(true);
  });

  it("동의 결과를 저장하면 묻은 것으로도 표시해요", () => {
    const next = setReminderAgreed(DEFAULT_STATE, true);
    expect(next.reminder).toEqual({ prompted: true, agreed: true });
  });

  it("알림 상태도 저장했다가 복원하고, 없으면 기본값이에요", () => {
    const state = setReminderAgreed(DEFAULT_STATE, true);
    expect(parseAppState(serializeAppState(state)).reminder).toEqual({
      prompted: true,
      agreed: true,
    });
    const legacy = JSON.stringify({ ...DEFAULT_STATE, reminder: undefined });
    expect(parseAppState(legacy).reminder).toEqual({ prompted: false, agreed: false });
  });
});

describe("updateSettings", () => {
  it("설정 일부만 바꾸고 나머지는 유지해요", () => {
    const next = updateSettings(DEFAULT_STATE, { monthlyGoal: 15 });
    expect(next.settings.monthlyGoal).toBe(15);
    expect(next.settings.dailyAverageSpend).toBe(
      DEFAULT_STATE.settings.dailyAverageSpend,
    );
  });

  it("범위를 벗어난 값은 잘라서 저장해요", () => {
    const next = updateSettings(DEFAULT_STATE, {
      monthlyGoal: 99,
      dailyAverageSpend: -100,
    });
    expect(next.settings.monthlyGoal).toBe(31);
    expect(next.settings.dailyAverageSpend).toBe(0);
  });
});
