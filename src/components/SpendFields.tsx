import { formatWon, parseWonInput } from "../domain/format";
import { SPEND_CATEGORIES } from "../domain/records";
import type { SpendDraft } from "../domain/spendDraft";
import { NumberField } from "./NumberField";

interface SpendFieldsProps {
  draft: SpendDraft;
  onChange: (draft: SpendDraft) => void;
}

export function SpendFields({ draft, onChange }: SpendFieldsProps) {
  const amount = parseWonInput(draft.amountText);
  return (
    <>
      <p className="card-title">어디에 썼나요? (선택)</p>
      <div className="chips">
        {SPEND_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip${draft.category === item.id ? " selected" : ""}`}
            onClick={() => onChange({ ...draft, category: draft.category === item.id ? undefined : item.id })}
          >
            {item.label}
          </button>
        ))}
      </div>
      <NumberField
        value={draft.amountText}
        onChange={(amountText) => onChange({ ...draft, amountText })}
        placeholder="얼마 썼나요? (선택)"
        maxDigits={8}
        preview={amount > 0 ? formatWon(amount) : undefined}
      />
    </>
  );
}
