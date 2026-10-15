import { Button } from "@toss/tds-mobile";
import { useState } from "react";

import { formatWon, parseWonInput } from "../domain/format";
import { BottomActions } from "./BottomActions";
import { NumberField } from "./NumberField";
import { type DayRecord, SPEND_CATEGORIES, type SpendCategory } from "../domain/records";

interface SpendFormProps {
  onSubmit: (record: DayRecord) => void;
  onCancel: () => void;
}

// 쓴 날은 부담 없이 넘길 수 있게 카테고리·금액 모두 선택 입력이에요.
export function SpendForm({ onSubmit, onCancel }: SpendFormProps) {
  const [category, setCategory] = useState<SpendCategory | undefined>();
  const [amountText, setAmountText] = useState("");
  const amount = parseWonInput(amountText);

  const submit = () =>
    onSubmit({
      status: "spent",
      ...(category ? { category } : {}),
      ...(amount > 0 ? { amount } : {}),
    });

  return (
    <div className="card">
      <p className="card-title">어디에 썼나요? (선택)</p>
      <div className="chips">
        {SPEND_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip${category === item.id ? " selected" : ""}`}
            onClick={() => setCategory(category === item.id ? undefined : item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <NumberField
        value={amountText}
        onChange={setAmountText}
        placeholder="얼마 썼나요? (선택)"
        maxDigits={8}
        preview={amount > 0 ? formatWon(amount) : undefined}
      />
      <BottomActions>
        <Button display="block" size="large" variant="weak" color="dark" onClick={onCancel}>
          취소
        </Button>
        <Button display="block" size="large" onClick={submit}>
          기록하기
        </Button>
      </BottomActions>
    </div>
  );
}
