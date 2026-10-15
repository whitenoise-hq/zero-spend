import { describe, expect, it } from "vitest";

import {
  buildShareMessage,
  formatMonthDay,
  formatMonthTitle,
  formatWon,
  parseWonInput,
} from "./format";

describe("formatWon", () => {
  it("천 단위 쉼표와 원을 붙여요", () => {
    expect(formatWon(0)).toBe("0원");
    expect(formatWon(123456)).toBe("123,456원");
  });
});

describe("parseWonInput", () => {
  it("숫자만 남겨서 정수로 바꾸고, 비어 있으면 0이에요", () => {
    expect(parseWonInput("12,000원")).toBe(12000);
    expect(parseWonInput("")).toBe(0);
    expect(parseWonInput("abc")).toBe(0);
  });
});

describe("formatMonthDay", () => {
  it("앞자리 0 없이 '10월 5일' 형태로 바꿔요", () => {
    expect(formatMonthDay("2026-10-05")).toBe("10월 5일");
    expect(formatMonthDay("2026-09-14")).toBe("9월 14일");
  });
});

describe("formatMonthTitle", () => {
  it("'2026년 10월' 형태로 바꿔요", () => {
    expect(formatMonthTitle("2026-01")).toBe("2026년 1월");
  });
});

describe("buildShareMessage", () => {
  it("이번 달 결과로 공유 문구를 만들어요", () => {
    expect(
      buildShareMessage({ month: "2026-10", successDays: 12, savedAmount: 240000, streak: 5 }),
    ).toBe(
      "10월 무지출 12일 성공! 약 240,000원 아꼈어요. 지금 5일째 이어가는 중이에요.",
    );
  });

  it("연속 기록이 없으면 그 문장은 빼요", () => {
    expect(
      buildShareMessage({ month: "2026-10", successDays: 0, savedAmount: 0, streak: 0 }),
    ).toBe("10월 무지출 0일 성공! 약 0원 아꼈어요.");
  });
});
