import { BottomSheet, Button } from "@toss/tds-mobile";
import { CalendarClock } from "lucide-react";
import { useState } from "react";

import type { DateKey } from "../domain/date";
import { formatMonthDay } from "../domain/format";
import type { DayRecord } from "../domain/records";
import { EMPTY_SPEND_DRAFT, toSpentRecord } from "../domain/spendDraft";
import { SpendFields } from "./SpendFields";

interface YesterdaySheetProps {
  open: boolean;
  date: DateKey;
  onSubmit: (record: DayRecord) => void;
  onClose: () => void;
}

// 광고를 본 뒤 어제 무지출했는지, 썼는지 직접 골라서 기록해요.
export function YesterdaySheet({ open, date, onSubmit, onClose }: YesterdaySheetProps) {
  const [step, setStep] = useState<"choose" | "spent">("choose");
  const [draft, setDraft] = useState(EMPTY_SPEND_DRAFT);

  const close = () => {
    setStep("choose");
    setDraft(EMPTY_SPEND_DRAFT);
    onClose();
  };

  const submit = (record: DayRecord) => {
    setStep("choose");
    setDraft(EMPTY_SPEND_DRAFT);
    onSubmit(record);
  };

  return (
    <BottomSheet
      open={open}
      onDimmerClick={close}
      header={<BottomSheet.Header>어제({formatMonthDay(date)}) 기록하기</BottomSheet.Header>}
      cta={
        <div className="sheet-cta sheet-cta-double">
          {step === "choose" ? (
            <>
              <Button display="block" size="large" variant="weak" color="dark" onClick={() => setStep("spent")}>
                썼어요
              </Button>
              <Button display="block" size="large" onClick={() => submit({ status: "success" })}>
                무지출 성공
              </Button>
            </>
          ) : (
            <>
              <Button display="block" size="large" variant="weak" color="dark" onClick={() => setStep("choose")}>
                이전
              </Button>
              <Button display="block" size="large" onClick={() => submit(toSpentRecord(draft))}>
                기록하기
              </Button>
            </>
          )}
        </div>
      }
    >
      {step === "choose" ? (
        <div className="day-detail">
          <div className="today-done-icon success">
            <CalendarClock size={24} strokeWidth={2.2} />
          </div>
          <div className="today-done-text">
            <strong>어제 돈을 썼나요?</strong>
            <span>있는 그대로 기록해야 연속 기록이 의미 있어요.</span>
          </div>
        </div>
      ) : (
        <div className="sheet-form">
          <SpendFields draft={draft} onChange={setDraft} />
        </div>
      )}
    </BottomSheet>
  );
}
