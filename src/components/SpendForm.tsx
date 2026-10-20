import { Button } from "@toss/tds-mobile";
import { useState } from "react";

import type { DayRecord } from "../domain/records";
import { BottomActions } from "./BottomActions";
import { EMPTY_SPEND_DRAFT, toSpentRecord } from "../domain/spendDraft";
import { SpendFields } from "./SpendFields";

interface SpendFormProps {
  onSubmit: (record: DayRecord) => void;
  onCancel: () => void;
}

export function SpendForm({ onSubmit, onCancel }: SpendFormProps) {
  const [draft, setDraft] = useState(EMPTY_SPEND_DRAFT);

  return (
    <div className="card">
      <SpendFields draft={draft} onChange={setDraft} />
      <BottomActions>
        <Button display="block" size="large" variant="weak" color="dark" onClick={onCancel}>
          취소
        </Button>
        <Button display="block" size="large" onClick={() => onSubmit(toSpentRecord(draft))}>
          기록하기
        </Button>
      </BottomActions>
    </div>
  );
}
