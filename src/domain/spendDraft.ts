import { parseWonInput } from "./format";
import type { DayRecord, SpendCategory } from "./records";

// 지출 입력 중인 값. 카테고리·금액 모두 선택 입력이에요.
export interface SpendDraft {
  category?: SpendCategory;
  amountText: string;
}

export const EMPTY_SPEND_DRAFT: SpendDraft = { amountText: "" };

export function toSpentRecord(draft: SpendDraft): DayRecord {
  const amount = parseWonInput(draft.amountText);
  return {
    status: "spent",
    ...(draft.category ? { category: draft.category } : {}),
    ...(amount > 0 ? { amount } : {}),
  };
}
