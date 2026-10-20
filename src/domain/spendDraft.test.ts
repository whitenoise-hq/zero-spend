import { describe, expect, it } from "vitest";

import { EMPTY_SPEND_DRAFT, toSpentRecord } from "./spendDraft";

describe("toSpentRecord", () => {
  it("아무것도 입력하지 않으면 썼다는 기록만 남겨요", () => {
    expect(toSpentRecord(EMPTY_SPEND_DRAFT)).toEqual({ status: "spent" });
  });

  it("카테고리와 금액을 함께 기록해요", () => {
    expect(toSpentRecord({ category: "food", amountText: "12000" })).toEqual({
      status: "spent",
      category: "food",
      amount: 12000,
    });
  });

  it("금액이 0이면 금액은 남기지 않아요", () => {
    expect(toSpentRecord({ category: "cafe", amountText: "0" })).toEqual({ status: "spent", category: "cafe" });
  });
});
